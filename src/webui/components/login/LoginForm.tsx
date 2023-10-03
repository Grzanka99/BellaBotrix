import { LoginLayout } from "./LoginLayout";

export const LoginForm = () => {
  return (
    <LoginLayout>
      <form class="login-form" method="post" action="/login/auth">
        <label>
          <span>username:</span>
          <input type="text" name="username" />
        </label>
        <label>
          <span>password:</span>
          <input type="password" name="password" />
        </label>
        <button type="submit">login</button>
      </form>
    </LoginLayout>
  );
};
