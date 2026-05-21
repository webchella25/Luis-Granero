import { CalculateMetadataFunction, Composition } from 'remotion';
import { AlmasIntro } from './AlmasIntro';
import { StudioLongVideo, StudioLongVideoProps } from './StudioLongVideo';

const studioDefaultProps: StudioLongVideoProps = {
  canalNombre: 'MI CANAL',
  personaje: 'VIDEO',
  epoca: '',
  images: [],
  sections: [],
  totalDuration: 60,
  introDuration: 0,
};

const calculateStudioMetadata: CalculateMetadataFunction<StudioLongVideoProps> = ({ props }) => {
  const duration = Math.max(1, props.totalDuration + props.introDuration);
  return {
    durationInFrames: Math.ceil(duration * 24),
    props,
  };
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="AlmasIntro"
      component={AlmasIntro}
      durationInFrames={210}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ nombre: 'MI CANAL', tagline: '' }}
    />
    <Composition
      id="StudioLongVideo"
      component={StudioLongVideo}
      durationInFrames={1890}
      fps={24}
      width={1920}
      height={1080}
      defaultProps={studioDefaultProps}
      calculateMetadata={calculateStudioMetadata}
    />
  </>
);
