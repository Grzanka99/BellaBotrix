type TProps = {
  children?: JSX.Element;
};

export const LoginLayout = ({ children }: TProps): JSX.Element => {
  return (
    <html lang="en">
      <head>
        <title>Bellatrix Bot</title>
        <script src="https://unpkg.com/htmx.org@1.9.6" />
        <link rel="stylesheet" href="/public/index.css" />
        <link rel="stylesheet" href="/public/login-page.css" />
        <style />
      </head>
      <body>
        <main class="login-content">{children}</main>
      </body>
    </html>
  );
};
