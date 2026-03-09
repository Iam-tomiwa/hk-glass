import { getErrorMessageFromAPi } from "@/lib/utils";
import { CircleAlert } from "lucide-react";
import type { APIErrorTypeWrapper } from "@/lib/types";

function ErrorMsg({ error }: { error: unknown | Error }) {
  const err = getErrorMessageFromAPi(error as unknown as APIErrorTypeWrapper);
  return (
    <div className="grow flex flex-col justify-center items-center my-8 mx-auto w-full min-h-[50vh] text-red-500">
      <CircleAlert className="my-4 w-[60px] h-[60px] sm:w-[90px] sm:h-[90px]" />
      <h2 className="font-semibold text-xl leading-6 m-0 text-black">
        Oops, Error
      </h2>
      <p className="font-normal text-base leading-6 my-2 mb-5 max-w-[21.4375rem] text-center text-gray-500 text-wrap">
        {err}
      </p>
    </div>
  );
}

export default ErrorMsg;
