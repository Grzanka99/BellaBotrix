export default `
create or replace procedure increase_single_user_points(uniqueid TEXT)
language plpgsql
as $$
BEGIN
	insert into "User" (points, userid, channel, username)
	values (
		1,
		substring(uniqueid from position(':' in uniqueid)+1),
		substring(uniqueid from position('@' in uniqueid)+1),
		substr(uniqueid, position(':' in uniqueid)+1, position('@' in uniqueid)-1)
	)
	on conflict (userid) do
		update set points = "User".points + 1
		where "User".userid = substring(uniqueid from position(':' in uniqueid)+1);
END;
$$;
`;
