import throwBallImage from "@/assets/images/throw-ball.svg";
import ballImage from "@/assets/images/ball.svg";
import { classNames } from "../../utils/classNames";

export type BackgroundDecorImageType = "ThrowBall" | "Ball";

type BackgroundDecorProps = {
  imageType: BackgroundDecorImageType;
  className?: string;
};

const IMAGE_SOURCE_MAP: Record<BackgroundDecorImageType, string> = {
  ThrowBall: throwBallImage,
  Ball: ballImage,
};

export const BackgroundDecor = ({ imageType, className }: BackgroundDecorProps) => (
  <img
    src={IMAGE_SOURCE_MAP[imageType]}
    alt=""
    aria-hidden="true"
    className={classNames("pointer-events-none fixed z-0", className)}
  />
);
