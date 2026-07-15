obs = obslua

local function controller_path()
    return script_path() .. "../tools/obs-companion-control.ps1"
end

local function run_controller(action)
    local path = controller_path():gsub('"', '""')
    local command = 'powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "'
        .. path .. '" ' .. action
    os.execute(command)
end

local function ensure_companion()
    run_controller("start")
end

function script_description()
    return [[
BubbleChat OBS Companion

OBS가 실행될 때 로컬 연결 보조 서버를 자동으로 시작하고,
OBS 종료 또는 스크립트 제거 시 자동으로 종료합니다.
]]
end

function script_load(settings)
    ensure_companion()
end

function script_unload()
    run_controller("stop")
end
