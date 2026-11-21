export const papers = [
  ['Model architecture', 'Attention Is All You Need', '1706.03762', 'How self-attention replaced recurrence in the Transformer.'],
  ['Retrieval', 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', '2005.11401', 'How a language model can use retrieved documents alongside its learned parameters.'],
  ['Fine-tuning', 'LoRA: Low-Rank Adaptation of Large Language Models', '2106.09685', 'How low-rank updates reduce the number of parameters trained during adaptation.'],
  ['Systems', 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness', '2205.14135', 'How reducing memory transfers makes exact attention more efficient.'],
  ['Alignment', 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model', '2305.18290', 'How to train directly on preference pairs without a separate reward model training step.'],
  ['Scaling', 'Scaling Laws for Neural Language Models', '2001.08361', 'How model size, dataset size, and compute relate to language-model training loss.']
];

export function isResearchPost(post) {
  return [post.category, ...(post.tags || [])].some(label =>
    String(label).trim().toLowerCase() === 'ai research'
  );
}
