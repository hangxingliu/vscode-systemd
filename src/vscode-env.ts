import { ExtensionContext, ExtensionKind, UIKind, env, workspace } from "vscode";

export function dumpVSCodeEnv(context: ExtensionContext) {
    console.log(
        [
            `UIKind=${UIKind[env.uiKind]}`,
            `ExtensionKind=${ExtensionKind[context.extension.extensionKind]}`,
            `appHost=${env.appHost}`,
            `remoteName=${env.remoteName}`,
            `isTrusted=${workspace.isTrusted}`,
        ].join("\n")
    );
}
