var constant = {};

constant.Action_Status = {
    None: 0,
    Approve: 1,
    Reject: 2
}

constant.Position = {
    Admin: "Admin",
    Manager: "Manager",
    SuperIntendant: "SuperIntendant",
    Supervisor: "Supervisor",
    Clerk: "Clerk",
    Engineer: "Engineer",
    Technician: "Technician"
}

constant.Department = {
    MEC: "MEC",
    IE: "IE",
    Production: "PR",
    Cutting: "Cutting",
    Planning: "Planning"
}

constant.WorkCenter = {
    Cutting92: 92,
    Cutting95: 95
}

constant.Part_Request_Type = {
    NewIssue: 0,
    Exchange: 1
}

constant.Enum_Action = {
    Cancel: 1,
    Call: 2,
    CCDSend: 3,
    WHSend: 4,
    Complete: 5,
    Issue: 6
}

module.exports = constant;