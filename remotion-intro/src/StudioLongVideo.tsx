import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Noise } from './components/Noise';
import { ScanLines } from './components/ScanLines';

export interface StudioSection {
  title: string;
  content: string;
  start: number;
  duration: number;
}

export interface StudioLongVideoProps extends Record<string, unknown> {
  canalNombre: string;
  personaje: string;
  epoca: string;
  images: string[];
  sections: StudioSection[];
  totalDuration: number;
  introDuration: number;
}

const BG = '#07090f';
const GOLD = '#d8b25a';
const RED = '#9f1d2a';

const cleanText = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^\(.*\)$/.test(line) && !/^\[.*\]$/.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const chunkByWords = (text: string, maxWords: number) => {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
};

const getActiveCaption = (sections: StudioSection[], time: number) => {
  const section = sections.find((s) => time >= s.start && time < s.start + s.duration);
  if (!section) return null;

  const chunks = chunkByWords(section.content, 6);
  if (!chunks.length) return null;

  const localTime = Math.max(0, time - section.start);
  const chunkDuration = section.duration / chunks.length;
  const index = Math.min(chunks.length - 1, Math.floor(localTime / chunkDuration));
  return {
    text: chunks[index],
    sectionTitle: section.title,
    progress: section.duration > 0 ? localTime / section.duration : 0,
  };
};

const Intro: React.FC<Pick<StudioLongVideoProps, 'canalNombre' | 'personaje' | 'epoca' | 'introDuration'>> = ({
  canalNombre,
  personaje,
  epoca,
  introDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(introDuration * fps));

  const titleOpacity = interpolate(frame, [8, 28, totalFrames - 20, totalFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(frame, [8, 36], [28, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const slashWidth = interpolate(frame, [24, 48], [0, 520], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(216,178,90,0.18), transparent 28%), linear-gradient(135deg, #050506 0%, #111723 52%, #050506 100%)',
        }}
      />
      <Noise opacity={0.07} animated />
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 120,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            color: '#8b91a3',
            fontSize: 28,
            letterSpacing: 8,
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {canalNombre}
        </div>
        <div
          style={{
            color: '#f4efe3',
            fontSize: personaje.length > 32 ? 72 : personaje.length > 20 ? 88 : 104,
            lineHeight: 1,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 700,
            textTransform: 'uppercase',
            textShadow: '0 8px 32px rgba(0,0,0,0.75)',
            maxWidth: 1500,
          }}
        >
          {personaje}
        </div>
        <div
          style={{
            width: slashWidth,
            height: 3,
            backgroundColor: RED,
            marginTop: 34,
            marginBottom: 28,
            boxShadow: `0 0 18px ${RED}`,
          }}
        />
        <div
          style={{
            color: GOLD,
            fontSize: 34,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {epoca}
        </div>
      </AbsoluteFill>
      <ScanLines opacity={0.06} />
    </AbsoluteFill>
  );
};

const AnimatedImage: React.FC<{ src: string; index: number; durationFrames: number }> = ({
  src,
  index,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationFrames)));
  const isEven = index % 2 === 0;
  const scale = interpolate(progress, [0, 1], isEven ? [1.08, 1.18] : [1.18, 1.08], {
    easing: Easing.inOut(Easing.quad),
  });
  const x = interpolate(progress, [0, 1], isEven ? [-18, 18] : [18, -18]);
  const y = interpolate(progress, [0, 1], index % 3 === 0 ? [-10, 10] : [10, -10]);
  const fadeFrames = Math.max(2, Math.min(18, Math.floor(durationFrames / 3)));
  const fade = interpolate(frame, [0, fadeFrames, durationFrames - fadeFrames, durationFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: fade, overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'contrast(1.05) saturate(0.9) brightness(0.84)',
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.08) 42%, rgba(0,0,0,0.62) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{ sections: StudioSection[]; introDuration: number; totalDuration: number }> = ({
  sections,
  introDuration,
  totalDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps - introDuration;
  if (time < 0 || time > totalDuration) return null;

  const active = getActiveCaption(sections, time);
  if (!active) return null;

  const key = `${active.sectionTitle}-${active.text}`;
  const localFrame = frame % fps;
  const opacity = interpolate(localFrame, [0, 4], [0.4, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 96 }}>
      <div
        key={key}
        style={{
          maxWidth: 1260,
          padding: '18px 30px 22px',
          borderRadius: 12,
          background: 'rgba(5,7,12,0.72)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 18px 48px rgba(0,0,0,0.44)',
          opacity,
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: active.text.length > 52 ? 48 : 56,
            lineHeight: 1.12,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: 800,
            textAlign: 'center',
            textShadow: '0 3px 14px rgba(0,0,0,0.8)',
          }}
        >
          {active.text}
        </div>
        <div
          style={{
            height: 4,
            background: 'rgba(255,255,255,0.16)',
            marginTop: 18,
            overflow: 'hidden',
            borderRadius: 999,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.max(4, Math.min(100, active.progress * 100))}%`,
              background: `linear-gradient(90deg, ${RED}, ${GOLD})`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SectionTitles: React.FC<{ sections: StudioSection[]; introDuration: number }> = ({
  sections,
  introDuration,
}) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {sections.slice(1).map((section, index) => {
        const from = Math.round((introDuration + section.start) * fps);
        return (
          <Sequence key={`${section.title}-${index}`} from={from} durationInFrames={Math.round(2.5 * fps)}>
            <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 92 }}>
              <div
                style={{
                  padding: '12px 28px',
                  borderTop: `2px solid ${GOLD}`,
                  borderBottom: `2px solid ${GOLD}`,
                  color: '#e7e2d6',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  fontSize: 34,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  background: 'rgba(0,0,0,0.32)',
                  boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                }}
              >
                {section.title.slice(0, 48)}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};

export const StudioLongVideo: React.FC<StudioLongVideoProps> = (props) => {
  const { fps } = useVideoConfig();
  const introFrames = Math.round(props.introDuration * fps);
  const imageCount = Math.max(1, props.images.length);
  const imageDurationFrames = Math.max(1, Math.round((props.totalDuration * fps) / imageCount));

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {introFrames > 0 && (
        <Sequence from={0} durationInFrames={introFrames}>
          <Intro
            canalNombre={props.canalNombre}
            personaje={props.personaje}
            epoca={props.epoca}
            introDuration={props.introDuration}
          />
        </Sequence>
      )}

      {props.images.map((image, index) => (
        <Sequence
          key={`${image}-${index}`}
          from={introFrames + index * imageDurationFrames}
          durationInFrames={imageDurationFrames + 2}
        >
          <AnimatedImage src={image} index={index} durationFrames={imageDurationFrames} />
        </Sequence>
      ))}

      <SectionTitles sections={props.sections} introDuration={props.introDuration} />
      <CaptionLayer
        sections={props.sections}
        introDuration={props.introDuration}
        totalDuration={props.totalDuration}
      />

      <ScanLines opacity={0.03} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 180px rgba(0,0,0,0.64)',
        }}
      />
    </AbsoluteFill>
  );
};
