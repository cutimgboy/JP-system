interface DepositButtonProps {
  onClick?: () => void;
}

export function DepositButton({ onClick }: DepositButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-[#6c48f5] flex h-[38px] items-center justify-center rounded-[16px] shadow-[0px_10px_15px_0px_rgba(108,72,245,0.2),0px_4px_6px_0px_rgba(108,72,245,0.2)] px-5 cursor-pointer hover:bg-[#5a3bd9] transition-colors shrink-0"
    >
      <span className="font-medium leading-[16px] text-[14px] text-white whitespace-nowrap">
        存款交易
      </span>
    </button>
  );
}
