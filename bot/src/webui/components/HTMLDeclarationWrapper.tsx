export const HTMLDeclarationWrapper = ({
  children,
}: { children: JSX.Element | JSX.Element[] }): JSX.Element => `<!DOCTYPE html>
<html lang="en">${Array.isArray(children) ? children.join("") : children}</html>`;
