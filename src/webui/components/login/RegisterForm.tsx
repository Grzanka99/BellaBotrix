import { LoginLayout } from "./LoginLayout";

export const RegisterForm = () => (
  <LoginLayout>

  <form class="reg-form" action="/login/register/auth" method="post">
    <label>
      <span>username:</span>
      <input type="text" name="username" />
    </label>
    <label>
      <span>password:</span>
      <input type="password" name="password" />
    </label>
    <label>
      <span>registration token:</span>
      <input type="password" name="regtoken" />
    </label>
    <button type="submit">register</button>
  </form>
  </LoginLayout>
);
