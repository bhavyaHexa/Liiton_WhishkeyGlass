import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';

export function PostProcessing() {
    // const { postProcessing } = useControls('PostProcessing', {
    //     postProcessing: false,
    // });

    return (
        <EffectComposer enableNormalPass={false} multisampling={4}>
            <N8AO
                aoRadius={40}
                intensity={10.5}
                distanceFalloff={0.1}
                denoiseSamples={64}
                quality={'medium'}
                screenSpaceRadius={true}
            />
        </EffectComposer>
    );
}