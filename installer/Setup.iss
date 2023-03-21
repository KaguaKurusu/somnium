#define MyAppName "Somnium"
#define MyAppVersion "0.1.0"
#define MyAppURL "https://github.com/KaguaKurusu/somnium"
#define MyAppExeName "somnium.exe"
#define MyAppDir "..\build\Release"

[Setup]
AppId={{E3B8E3AD-2A6E-4CF5-AE32-49AE05E20B5E}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
WizardStyle=modern
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={cm:MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
SetupIconFile=..\icon\win\app.ico
DefaultDirName={pf}\{#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=..\LICENSE
OutputDir=..\build\Installer
OutputBaseFilename={#MyAppName}Setup
Compression=lzma
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64 arm64
UninstallDisplayIcon={app}\{#MyAppName}.exe
UninstallDisplayName={#MyAppName}

[Languages]
Name: ja; MessagesFile: "compiler:Languages\Japanese.isl"

[CustomMessages]
ja.MyAppPublisher=来栖華紅鴉
ja.DeleteSettingsData=設定ファイルを削除しますか？

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "{#MyAppDir}\{#MyAppName}-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Check: InstallX64
Source: "{#MyAppDir}\{#MyAppName}-win32-ia32\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs solidbreak; Check: InstallOtherArch
Source: "{#MyAppDir}\{#MyAppName}-win32-arm64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs solidbreak; Check: InstallARM64
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{commonprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  isDelSettings: Boolean;
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  case CurUninstallStep of
    usUninstall:
      begin
        isDelSettings := MsgBox(CustomMessage('DeleteSettingsData'), mbConfirmation, MB_YESNO) = idYes;
      end;
  usPostUninstall:
    begin
      if isDelSettings = True then begin
        DelTree(GetEnv('APPDATA') + '\{#MyAppName}', True, True, True);
      end;
    end;
  end;
end;

function InstallX64: Boolean;
begin
  Result := Is64BitInstallMode and (ProcessorArchitecture = paX64);
end;

function InstallARM64: Boolean;
begin
  Result := Is64BitInstallMode and (ProcessorArchitecture = paARM64);
end;

function InstallOtherArch: Boolean;
begin
  Result := not InstallX64 and not InstallARM64;
end;
