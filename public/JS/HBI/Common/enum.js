// General
// Department
var Enum_Department = {
    Cutting: "Cutting",
    Production: "Production",
    Warehouse: "Warehouse"
}

// #region MECHANIC

// Action enum
var Enum_Action = {
    None: 0,
    Approve: 1,
    Reject: 2
}

// Action enum
var Enum_Kanban_Action = {
    Cancel: 1,
    Call: 2,
    CCDSend: 3,
    WHSend: 4,
    Complete: 5,
    Issue: 6
}

// Request Type enum
var Request_Type = {
    NewIssue: 0, // cấp mới
    Exchange: 1, // đổi trả
}

// 
var Enum_User_Type = {
    Manager: 1,
    SeniorManager: 2,
    Clerk: 3
}

// Enum Position
var Enum_User_Position = {
    Clerk: "Clerk",
    Supervisor: "Supervisor",
    Superintendant: "SuperIntendant",
    Admin: "Admin"
}

// #endregion

// #region Production

var Enum_Production = {
    Production: 1,
    Cutting: 2,
    Other: 3
}

// #endregion

// #region Other add-in below this section


// #endregion