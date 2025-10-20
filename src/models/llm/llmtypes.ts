 type llm = {
    apiKey: string;
    model: string;
}


const llmlist = {
    MISTRAL_NEMO: {
        apiKey: process.env.MISTRAL_NEMO_API_KEY || '',
        model: 'mistralai/mistral-nemo:free'
    },
    MISTRAL_SMALL_24B: {
        apiKey: process.env.MISTRAL_SMALL_24B_API_KEY || '',
        model: 'mistralai/mistral-small-3.2-24b-instruct:free'
    },

    QWEN3_235B: {
        apiKey: process.env.QWEN3_238B_API_KEY || '',
        model: 'qwen/qwen3-235b-a22b-07-25:free'
    },
}

export { llmlist, llm };