import { useEffect } from "react";
import { createBrowserRouter, Outlet, useNavigate } from "react-router";
import RedesignTradingAppStyles from "../imports/RedesignTradingAppStyles";
import { ActivityPage } from "./components/ActivityPage";
import { AboutUsPage } from "./components/AboutUsPage";
import { DepositPage } from "./components/DepositPage";
import { AddBankCardPage } from "./components/AddBankCardPage";
import { DepositFundPage } from "./components/DepositFundPage";
import { UploadVoucherPage } from "./components/UploadVoucherPage";
import { MyBanksPage } from "./components/MyBanksPage";
import { FundsRecordPage } from "./components/FundsRecordPage";
import { OrderDetailsPage } from "./components/OrderDetailsPage";
import { TransferDetailsPage } from "./components/TransferDetailsPage";
import { WithdrawSelectBankPage } from "./components/WithdrawSelectBankPage";
import { WithdrawAmountPage } from "./components/WithdrawAmountPage";
import { WithdrawIdentityPage } from "./components/WithdrawIdentityPage";
import { LanguagePage } from "./components/LanguagePage";
import { PersonalInfoPage } from "./components/PersonalInfoPage";
import { ChangePasswordPage } from "./components/ChangePasswordPage";
import { InstallAppPage } from "./components/InstallAppPage";

function RedirectHome() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
}

function Root() {
  return (
    <div className="size-full flex items-center justify-center bg-[#09090b]">
      <Outlet />
    </div>
  );
}

function RootErrorBoundary() {
  useEffect(() => {
    window.location.href = "/";
  }, []);
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: RootErrorBoundary,
    children: [
      { index: true, Component: RedesignTradingAppStyles },
      { path: "trade", Component: RedirectHome }, // Add /trade route to recover from stuck URL
      { path: "activity", Component: ActivityPage },
      { path: "about", Component: AboutUsPage },
      { path: "deposit", Component: DepositPage },
      { path: "deposit/add-card", Component: AddBankCardPage },
      { path: "deposit/fund", Component: DepositFundPage },
      { path: "deposit/upload-voucher", Component: UploadVoucherPage },
      { path: "my-banks", Component: MyBanksPage },
      { path: "funds-record", Component: FundsRecordPage },
      { path: "order-detail/:id", Component: OrderDetailsPage },
      { path: "transfer-detail/:id", Component: TransferDetailsPage },
      { path: "withdraw/select-bank", Component: WithdrawSelectBankPage },
      { path: "withdraw/amount", Component: WithdrawAmountPage },
      { path: "withdraw/identity", Component: WithdrawIdentityPage },
      { path: "profile/language", Component: LanguagePage },
      { path: "profile/info", Component: PersonalInfoPage },
      { path: "profile/password", Component: ChangePasswordPage },
      { path: "profile/install", Component: InstallAppPage },
      { path: "*", Component: RedirectHome },
    ],
  },
]);
