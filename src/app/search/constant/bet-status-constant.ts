import { Option } from "src/app/models/option.model";

export const BetStatusConstant: Option[] =
    [
        { id: "0", viewValue: "Open" },
        { id: "3", viewValue: "Won" },
        { id: "2", viewValue: "Lost" },
        { id: "5", viewValue: "Cancelled" },
        { id: "15", viewValue: "Cancelled in BCT" },
        { id: "13", viewValue: "Won in BCT" },
        { id: "12", viewValue: "Lost in BCT" }
      ];