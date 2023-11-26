---
date: 2023-11-20
---
# Release New Version SOP

1. Modify the version field (and `preview` field) in [package.json](../package.json)
2. Add new section in [CHANGELOG.md](./CHANGELOG.md)
3. Update changelog section in [README.md](../README.md)
4. Waiting for Github CI build to be done
5. Trigger `publish-vscode-extension` workflow on Github 
6. Check it on <https://marketplace.visualstudio.com/manage/publishers/hangxingliu> after 10~15 minutes
7. Test the extension on the following platform/app:
    1. Visual Studio Code
    2. Visual Studio Code Web - <https://vscode.dev/>
    3. VSCodium - <https://vscodium.com/> (*Install from VSIX...*)
8. Create and push Git tag. e.g., `git tag 2.0.0-preview`, `git push --tags`
9. Create a new release at <https://github.com/hangxingliu/vscode-systemd/releases/new>
10. Release vsix file to Open VSX
    - URL: <https://open-vsx.org/user-settings/extensions>
    - **ONLY** Publish vsix file built through CI from: <https://github.com/hangxingliu/vscode-systemd/actions/workflows/ci.yaml>
11.

## Create a New Access Token

<https://hangxingliu.visualstudio.com/_usersSettings/tokens>

- Name: `balabalabala...`
- Organization: `hangxingliu`
- Expiration (UTC): `30days`
- Scopes: (Click "Show all scopes")
    - [x] Marketplace > Manage
