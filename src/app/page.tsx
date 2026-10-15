import { Header } from "@/components/Header";
import { Cursor } from "@/components/Cursor";
import { StickyCta } from "@/components/StickyCta";
import { SvgDefs } from "@/components/svg/Defs";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { MotionDirector } from "@/components/motion/MotionDirector";
import { Hero } from "@/components/sections/Hero";
import { Statement } from "@/components/sections/Statement";
import { DiveLogs } from "@/components/sections/DiveLogs";
import { Chart } from "@/components/sections/Chart";
import { FieldDay } from "@/components/sections/FieldDay";
import { SealedFiles } from "@/components/sections/SealedFiles";
import { Register } from "@/components/sections/Register";
import { Rules } from "@/components/sections/Rules";
import { Crew } from "@/components/sections/Crew";
import { End } from "@/components/sections/End";

export default function Page() {
  return (
    <SmoothScroll>
      <a className="skip" href="#statement">
        Skip to content
      </a>
      <SvgDefs />
      <Header />
      <main>
        <Hero />
        <Statement />
        <DiveLogs />
        <Chart />
        <FieldDay />
        <SealedFiles />
        <Register />
        <Rules />
        <Crew />
        <End />
      </main>
      <StickyCta />
      <Cursor />
      <MotionDirector />
    </SmoothScroll>
  );
}
