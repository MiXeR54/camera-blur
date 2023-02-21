import Webcam from "react-webcam";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

export default function Home() {
  const [isBlur, setIsBlur] = useState<boolean>(false);
  const [model, setModel]: any = useState();
  const [callBackId, setCallBackId]: any = useState();

  const handleBlur = (e: any) => {
    if (e.key === " ") {
      setIsBlur((prev) => !prev);
    }
  };

  useEffect(() => {
    const params: any = {
      architecture: "MobileNetV1",
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    };

    bodyPix.load(params).then((net: any) => {
      setModel(net);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", handleBlur, true);
  }, []);

  useEffect(() => {
    if (isBlur) {
      const removeBg = async () => {
        const video: any = document.getElementById("webcam");
        const canvas: any = document.getElementById("canvas");

        if (!model) return;
        const segmentation = await model.segmentPerson(video, {
          flipHorizontal: false,
          internalResolution: "medium",
          segmentationThreshold: 0.5,
        });

        const backgroundBlurAmount = 30;
        const edgeBlurAmount = 10;
        const flipHorizontal = false;
        bodyPix.drawBokehEffect(
          canvas,
          video,
          segmentation,
          backgroundBlurAmount,
          edgeBlurAmount,
          flipHorizontal
        );

        setCallBackId(requestAnimationFrame(removeBg));
      };
      removeBg();
    } else {
      cancelAnimationFrame(callBackId);
    }
  }, [isBlur]);

  console.log(isBlur);

  return (
    <>
      <main className={styles.main}>
        <div className={styles.wrapper}>
          <Webcam
            id="webcam"
            className={styles.cameraStyle}
            width={640}
            height={480}
          />

          <canvas
            id="canvas"
            className={isBlur ? styles.canvasStyle : styles.disableStyle}
            width={640}
            height={480}
          />
        </div>
        <p>Press Space to toggle blur</p>
      </main>
    </>
  );
}
