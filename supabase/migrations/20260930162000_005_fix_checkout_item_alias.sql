/* Fix the PL/pgSQL variable and JSON record alias collision in create_order. */
CREATE OR REPLACE FUNCTION public.create_order(
        p_customer_name text,
        p_address text,
        p_city text,
        p_zip text,
        p_items jsonb
    ) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE authenticated_email text;
checkout_item jsonb;
product_record public.products %ROWTYPE;
product_id integer;
quantity integer;
subtotal numeric(10, 2) := 0;
shipping numeric(10, 2);
tax numeric(10, 2);
grand_total numeric(10, 2);
normalized_items jsonb := '[]'::jsonb;
order_id integer;
BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required';
END IF;
SELECT email INTO authenticated_email
FROM auth.users
WHERE id = auth.uid();
IF authenticated_email IS NULL THEN RAISE EXCEPTION 'Authenticated email is required';
END IF;
IF length(trim(p_customer_name)) < 2
OR length(trim(p_address)) < 5
OR length(trim(p_city)) < 2
OR length(trim(p_zip)) < 4
OR jsonb_typeof(p_items) <> 'array'
OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'Invalid checkout details';
END IF;
IF (
    SELECT count(*)
    FROM jsonb_array_elements(p_items)
) <> (
    SELECT count(DISTINCT (value->>'productId')::integer)
    FROM jsonb_array_elements(p_items)
) THEN RAISE EXCEPTION 'Duplicate products are not allowed';
END IF;
FOR checkout_item IN
SELECT value
FROM jsonb_array_elements(p_items) LOOP product_id := (checkout_item->>'productId')::integer;
quantity := (checkout_item->>'quantity')::integer;
IF product_id IS NULL
OR quantity IS NULL
OR quantity <= 0 THEN RAISE EXCEPTION 'Invalid order item';
END IF;
SELECT * INTO product_record
FROM public.products
WHERE id = product_id FOR
UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Product % is unavailable',
product_id;
END IF;
IF product_record.stock < quantity THEN RAISE EXCEPTION 'Insufficient stock for %',
product_record.name;
END IF;
UPDATE public.products
SET stock = stock - quantity
WHERE id = product_id;
subtotal := subtotal + (product_record.price * quantity);
normalized_items := normalized_items || jsonb_build_array(
    jsonb_build_object(
        'productId',
        product_record.id,
        'name',
        product_record.name,
        'price',
        product_record.price,
        'quantity',
        quantity
    )
);
END LOOP;
shipping := CASE
    WHEN subtotal >= 99.00 THEN 0.00
    ELSE 9.99
END;
tax := round(subtotal * 0.08, 2);
grand_total := subtotal + shipping + tax;
INSERT INTO public.orders (
        user_id,
        customer_name,
        email,
        address,
        city,
        zip,
        total,
        status,
        items
    )
VALUES (
        auth.uid(),
        trim(p_customer_name),
        authenticated_email,
        trim(p_address),
        trim(p_city),
        trim(p_zip),
        grand_total,
        'pending',
        normalized_items
    )
RETURNING id INTO order_id;
INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        unit_price,
        quantity
    )
SELECT order_id,
    (line_item.value->>'productId')::integer,
    line_item.value->>'name',
    (line_item.value->>'price')::numeric(10, 2),
    (line_item.value->>'quantity')::integer
FROM jsonb_array_elements(normalized_items) AS line_item(value);
RETURN jsonb_build_object(
    'orderId',
    order_id,
    'subtotal',
    subtotal,
    'shipping',
    shipping,
    'tax',
    tax,
    'total',
    grand_total
);
END;
$$;
REVOKE ALL ON FUNCTION public.create_order(text, text, text, text, jsonb)
FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, jsonb) TO authenticated;