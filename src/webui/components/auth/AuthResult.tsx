import { R_PANEL } from "webui/routes";

export const AuthResult = ( success: boolean) => {
  if (success) {
    return (
      <div>
        <h2>Authorized</h2>
        <a href={R_PANEL}>Return to panel</a>
      </div>
    );
  }

  return (
    <div>
      <h2>Something went wrong with authorization</h2>
      <h3>Bot may stop working!</h3>
      <a href={R_PANEL}>Return to panel</a>
    </div>
  );
};
