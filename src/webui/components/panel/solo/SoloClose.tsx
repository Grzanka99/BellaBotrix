import { TSingleUiSolo, TSingleUiSoloReq } from "webui/types";
import { SingleSolo } from "./SingleSolo";
import { prisma } from "services/db";

export const SoloClose = async (props: TSingleUiSoloReq) => {
  const solo: TSingleUiSolo = {
    ...props,
    id: Number(props.id),
    points: Number(props.points),
    inProgress: true,
  };

  try {
    const res = await prisma.solo.update({
      where: { id: solo.id },
      data: { inProgress: false },
    });

    return <SingleSolo {...res} />;
  } catch (err) {
    <SingleSolo {...solo} />;
  }
};
