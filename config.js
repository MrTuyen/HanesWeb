var config = {};

// Log path
config.logFilePath = "C:/NGUYENVANTUYEN/NodeJS/HaneApp/Hanes/logs/";
config.imageFilePath = "C:/NGUYENVANTUYEN/NodeJS/HaneApp/Hanes/public/Image/Parts/";

// Mail
config.mailHost = "hbiexchsmtp-vip.res.hbi.net";
config.mailPort = 25;
config.mailSystem = "hbi_system@hanes.com";

// TTS account
config.TTS_Account = "thle11";
config.TTS_Password = "Baonam02";

// Fabric Receive
config.MailList = `HYS_Warehouse_92_Fabric@hanes.com,
                    Cuttingteam@hanes.onmicrosoft.com,
                    Cutting95@hanes.onmicrosoft.com,
                    Marker_92_WB@hanes.onmicrosoft.com,
                    marker_bra@hanes.onmicrosoft.com,
                    HYS_PLANNING_Team@hanes.com,
                    HBI_Planning_HYN@hanes.com`;

config.TestMailList = `hys_innovation@hanes.onmicrosoft.com`;

module.exports = config;