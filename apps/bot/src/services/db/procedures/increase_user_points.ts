export default `
create or replace procedure increase_users_points(uniqueids TEXT[])
language plpgsql
as $$
DECLARE
	element TEXT;
BEGIN
	FOR element IN SELECT unnest(uniqueids)
	LOOP
		CALL increase_single_user_points(element);
	END LOOP;
END;
$$;
`;
