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
    }
}

export { llmlist, llm };