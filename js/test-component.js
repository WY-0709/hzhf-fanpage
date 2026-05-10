/**
 * 通用测试组件 - 合并性格测试和粉丝类型测试
 * 使用方式：
 *   const test = new TestComponent(config);
 *   test.init();
 */

class TestComponent {
  constructor(config) {
    this.config = {
      containerId: '',           // 容器 ID
      startBtnId: '',            // 开始按钮 ID
      questionId: '',            // 问题显示 ID
      optionsId: '',             // 选项容器 ID
      progressId: '',            // 进度显示 ID
      resultId: '',              // 结果容器 ID
      resultTitleId: '',         // 结果标题 ID
      resultDescId: '',          // 结果描述 ID
      questions: [],             // 问题数组
      resultTypes: [],           // 结果类型数组
      mode: 'single',            // 'single' 单分数 或 'multi' 多维度
      ...config
    };

    this.currentStep = 0;
    this.score = 0;              // 单分数模式
    this.scores = [];            // 多维度模式
    this.isMultiMode = this.config.mode === 'multi';

    if (this.isMultiMode) {
      this.scores = new Array(this.config.resultTypes.length).fill(0);
    }
  }

  init() {
    this._bindStartButton();
  }

  _$(id) {
    return document.getElementById(id);
  }

  _bindStartButton() {
    const btn = this._$(this.config.startBtnId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      this.reset();
      this.render();
    });
  }

  reset() {
    this.currentStep = 0;
    this.score = 0;
    this.scores = this.isMultiMode
      ? new Array(this.config.resultTypes.length).fill(0)
      : [];

    const resultEl = this._$(this.config.resultId);
    if (resultEl) resultEl.style.display = 'none';

    const startBtn = this._$(this.config.startBtnId);
    if (startBtn) startBtn.style.display = 'none';
  }

  render() {
    if (this.currentStep >= this.config.questions.length) {
      this.showResult();
      return;
    }

    const q = this.config.questions[this.currentStep];
    const total = this.config.questions.length;

    // 更新进度
    const progressEl = this._$(this.config.progressId);
    if (progressEl) {
      progressEl.textContent = `第 ${this.currentStep + 1} / ${total} 题`;
    }

    // 更新问题
    const questionEl = this._$(this.config.questionId);
    if (questionEl) {
      questionEl.textContent = q.q;
    }

    // 更新选项
    const optionsEl = this._$(this.config.optionsId);
    if (optionsEl) {
      optionsEl.innerHTML = '';
      q.opts.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'pt-opt ripple-host';
        btn.textContent = opt[0];

        btn.addEventListener('click', () => {
          this._handleOptionClick(opt, index);
        });

        optionsEl.appendChild(btn);
      });
    }
  }

  _handleOptionClick(opt, index) {
    if (this.isMultiMode) {
      // 多维度模式：opt[1] 是维度索引
      this.scores[opt[1]]++;
    } else {
      // 单分数模式：opt[1] 是分数
      this.score += opt[1];
    }

    this.currentStep++;
    this.render();
  }

  showResult() {
    let resultIndex;

    if (this.isMultiMode) {
      // 多维度：找最高分的维度
      resultIndex = this.scores.indexOf(Math.max(...this.scores));
    } else {
      // 单分数：根据分数范围找结果
      resultIndex = this._getResultIndexBySingleScore();
    }

    const result = this.config.resultTypes[resultIndex];

    // 隐藏问题区域
    const questionEl = this._$(this.config.questionId);
    if (questionEl) questionEl.textContent = '✨ 测试完成！';

    const optionsEl = this._$(this.config.optionsId);
    if (optionsEl) optionsEl.innerHTML = '';

    const progressEl = this._$(this.config.progressId);
    if (progressEl) progressEl.textContent = '';

    // 显示结果
    const resultEl = this._$(this.config.resultId);
    if (resultEl) resultEl.style.display = 'block';

    const titleEl = this._$(this.config.resultTitleId);
    if (titleEl) titleEl.textContent = result.title;

    const descEl = this._$(this.config.resultDescId);
    if (descEl) descEl.textContent = result.desc;

    // 显示重新测试按钮
    const startBtn = this._$(this.config.startBtnId);
    if (startBtn) {
      startBtn.textContent = this.isMultiMode ? '再测一次' : '重新测试';
      startBtn.style.display = 'inline-block';
    }
  }

  _getResultIndexBySingleScore() {
    // 单分数模式：根据分数范围返回结果索引
    // 这个方法需要根据具体的分数范围自定义
    // 默认实现：按分数从高到低排序

    const maxScore = this.config.questions.length * 10; // 假设每题最高 10 分
    const percentage = (this.score / maxScore) * 100;

    // 根据百分比返回索引
    if (percentage >= 80) return 0;
    if (percentage >= 60) return 1;
    if (percentage >= 40) return 2;
    if (percentage >= 20) return 3;
    return 4;
  }
}

// ═══════════════════════════════════════════════════════════════
// 使用示例
// ═══════════════════════════════════════════════════════════════

// 性格测试（单分数模式）
const personalityTest = new TestComponent({
  containerId: 'pt-container',
  startBtnId: 'pt-start',
  questionId: 'pt-question',
  optionsId: 'pt-options',
  progressId: 'pt-progress',
  resultId: 'pt-result',
  resultTitleId: 'pt-result-title',
  resultDescId: 'pt-result-desc',
  mode: 'single',
  questions: PT_QS,  // 从全局变量获取
  resultTypes: [
    {
      title: '🌟 灵魂共鸣型 · 契合度 95%+',
      desc: '你和黄子弘凡几乎是同一类人——热情、自由、追求极致、享受当下。你们都相信「除了快乐禁止入内」不只是一句歌词，而是一种活法。蟹黄堡资深成员，实至名归！'
    },
    {
      title: '💛 志同道合型 · 契合度 75%',
      desc: '你们有很深的精神共鸣，对音乐、舞台和真实情感都有高度认同。你欣赏他的极致与热情，他的音乐也真实触动过你。是很好的精神伙伴。'
    },
    {
      title: '💙 欣赏型粉丝 · 契合度 55%',
      desc: '你被他的才华和真诚所吸引，虽然性格不完全相同，但正因如此，他的音乐能给你带来全新的视角和感受。互补才是最美的相遇。'
    },
    {
      title: '🌸 温柔旁观型 · 契合度 40%',
      desc: '你更偏安静内敛，和他外放热情的风格有些不同，但你能感受到他音乐里的真诚。也许你喜欢的正是他身上你没有的那份勇敢。'
    },
    {
      title: '🌱 初识阶段 · 契合度 25%',
      desc: '你们还在相互了解的阶段！多听几首他的歌，说不定会发现意想不到的共鸣。每个人都有属于自己的那首黄子弘凡。'
    }
  ]
});

// 粉丝类型测试（多维度模式）
const fanTypeTest = new TestComponent({
  containerId: 'ft-container',
  startBtnId: 'ft-start',
  questionId: 'ft-question',
  optionsId: 'ft-options',
  progressId: 'ft-progress',
  resultId: 'ft-result',
  resultTitleId: 'ft-result-title',
  resultDescId: 'ft-result-desc',
  mode: 'multi',
  questions: FT_QS,  // 从全局变量获取
  resultTypes: FT_RESULTS  // 从全局变量获取
});

// 初始化
personalityTest.init();
fanTypeTest.init();
