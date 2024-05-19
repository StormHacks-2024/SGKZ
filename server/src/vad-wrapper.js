import VAD from 'node-vad';
const vad = new VAD(VAD.Mode.NORMAL);

const processAudio = async (buffer, sampleRate) => {
    try {
        const result = await vad.processAudio(buffer, sampleRate);
        return result;
    } catch (error) {
        console.error('VAD processing error:', error);
        throw error;
    }
};

module.exports = {
    VAD,
    processAudio
};
