(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  // Reading progress and active chapter
  var progressBar = $('#reading-progress');
  function updateReadingProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var percent = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    if (progressBar) progressBar.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);
  updateReadingProgress();

  var chapterLinks = $$('.toc-link');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        chapterLinks.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
    $$('.chapter').forEach(function (section) { observer.observe(section); });
  }

  var jump = $('#section-jump');
  if (jump) {
    jump.addEventListener('change', function () {
      if (jump.value) document.getElementById(jump.value).scrollIntoView({ behavior: 'smooth' });
    });
  }
  var printButton = $('#print-page');
  if (printButton) printButton.addEventListener('click', function () { window.print(); });

  // Equation detective
  var detectiveSolved = new Set();
  var detectiveCards = $$('.detective-card');
  function updateDetectiveProgress() {
    var output = $('#detective-progress');
    if (output) output.textContent = detectiveSolved.size + ' / ' + detectiveCards.length;
    var note = $('#detective-complete');
    if (note) note.hidden = detectiveSolved.size !== detectiveCards.length;
  }
  detectiveCards.forEach(function (card, index) {
    var answer = card.dataset.equation;
    var feedback = $('.detective-feedback', card);
    $$('button[data-choice]', card).forEach(function (button) {
      button.addEventListener('click', function () {
        var correct = button.dataset.choice === answer;
        feedback.className = 'detective-feedback ' + (correct ? 'is-correct' : 'is-wrong');
        if (correct) {
          feedback.textContent = answer === 'yes' ? '判断正确：它既含有未知数，又是一个等式。' : '判断正确：' + card.dataset.reason;
          detectiveSolved.add(index);
          card.classList.add('is-solved');
          $$('button[data-choice]', card).forEach(function (choice) {
            choice.classList.toggle('is-selected', choice === button);
          });
        } else {
          feedback.textContent = '再想一想：先找等号，再看看有没有未知数。';
          card.classList.remove('is-solved');
          detectiveSolved.delete(index);
        }
        updateDetectiveProgress();
      });
    });
  });
  updateDetectiveProgress();

  // Balance lab
  var balanceState = 0;
  var leftWeights = $('#left-weights');
  var rightWeights = $('#right-weights');
  function weightMarkup(count) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="weight" aria-hidden="true">1</span>';
    return html;
  }
  function renderBalance() {
    var solved = balanceState === 1;
    if (leftWeights) leftWeights.innerHTML = weightMarkup(solved ? 0 : 3);
    if (rightWeights) rightWeights.innerHTML = weightMarkup(solved ? 5 : 8);
    $('#balance-equation').textContent = solved ? 'x = 5' : 'x + 3 = 8';
    $('#balance-status').textContent = solved
      ? '两边同时拿走 3，天平仍然平衡。现在可以看清：x = 5。'
      : '左边是 x 和 3 个 1，右边是 8 个 1。试着从两边同时拿走 3。';
    $('#balance-check').hidden = !solved;
    $('#balance-action').disabled = solved;
    $('#balance-action').textContent = solved ? '已完成：两边同时减 3' : '两边同时减去 3';
  }
  if ($('#balance-action')) {
    $('#balance-action').addEventListener('click', function () {
      balanceState = 1;
      renderBalance();
    });
    $('#balance-reset').addEventListener('click', function () {
      balanceState = 0;
      renderBalance();
    });
    renderBalance();
  }

  // Guided worked example
  var exampleSteps = [
    {
      label: '第 1 步：读题，确定目标',
      title: '要求出未知数 x',
      math: 'x + 17 = 42',
      text: 'x 和 17 合起来是 42。要让左边只剩下 x，就需要去掉多加的 17。'
    },
    {
      label: '第 2 步：两边同时减 17',
      title: '等号两边做相同的运算',
      math: 'x + 17 − 17 = 42 − 17',
      text: '左边减 17，右边也必须减 17。这样等式仍然成立，这就是等式的性质。'
    },
    {
      label: '第 3 步：分别计算两边',
      title: '得到方程的解',
      math: 'x = 25',
      text: '左边 17 − 17 = 0，所以只剩 x；右边 42 − 17 = 25。因此 x 的值是 25。'
    },
    {
      label: '第 4 步：代入原方程检验',
      title: '确认左边和右边真的相等',
      math: '25 + 17 = 42 ✓',
      text: '把 x = 25 代回原方程，左边是 42，右边也是 42，所以 x = 25 是原方程的解。'
    }
  ];
  var exampleIndex = 0;
  function renderExample() {
    var step = exampleSteps[exampleIndex];
    $('#example-step-label').textContent = step.label;
    $('#example-step-title').textContent = step.title;
    $('#example-step-math').textContent = step.math;
    $('#example-step-text').textContent = step.text;
    $('#example-count').textContent = '第 ' + (exampleIndex + 1) + ' / ' + exampleSteps.length + ' 步';
    $('#example-prev').disabled = exampleIndex === 0;
    $('#example-next').textContent = exampleIndex === exampleSteps.length - 1 ? '回到第 1 步' : '下一步';
    $$('.step-dot').forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === exampleIndex);
      dot.classList.toggle('is-done', index < exampleIndex);
    });
  }
  if ($('#example-next')) {
    $('#example-next').addEventListener('click', function () {
      exampleIndex = (exampleIndex + 1) % exampleSteps.length;
      renderExample();
    });
    $('#example-prev').addEventListener('click', function () {
      if (exampleIndex > 0) exampleIndex -= 1;
      renderExample();
    });
    $$('.step-dot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        exampleIndex = Number(dot.dataset.step);
        renderExample();
      });
    });
    renderExample();
  }

  // Practice set
  var questions = [
    {
      level: '基础', type: 'input', question: '解方程：x + 9 = 21', answer: 12,
      hint: 'x 多加了 9，两边要同时减去 9。',
      explanation: 'x + 9 = 21，两边同时减 9，得到 x = 21 − 9 = 12。检验：12 + 9 = 21。'
    },
    {
      level: '基础', type: 'input', question: '解方程：x − 14 = 26', answer: 40,
      hint: 'x 被减去了 14，要用加法还原。',
      explanation: '两边同时加 14，得到 x = 26 + 14 = 40。检验：40 − 14 = 26。'
    },
    {
      level: '基础', type: 'input', question: '解方程：7x = 56', answer: 8,
      hint: '7x 表示 7 × x，两边同时除以 7。',
      explanation: '7x ÷ 7 = 56 ÷ 7，所以 x = 8。检验：7 × 8 = 56。'
    },
    {
      level: '基础', type: 'input', question: '解方程：x ÷ 6 = 9', answer: 54,
      hint: 'x 被平均分成了 6 份，要用乘法还原。',
      explanation: '两边同时乘 6，得到 x = 9 × 6 = 54。检验：54 ÷ 6 = 9。'
    },
    {
      level: '进阶', type: 'input', question: '解方程：3x + 4 = 25', answer: 7,
      hint: '先去掉加上的 4，再处理乘上的 3。',
      explanation: '两边先减 4：3x = 21；再同时除以 3：x = 7。检验：3 × 7 + 4 = 25。'
    },
    {
      level: '进阶', type: 'input', question: '解方程：5x − 8 = 37', answer: 9,
      hint: '先两边加 8，再两边除以 5。',
      explanation: '5x − 8 + 8 = 37 + 8，得到 5x = 45；再除以 5，得到 x = 9。检验：5 × 9 − 8 = 37。'
    },
    {
      level: '挑战', type: 'input', question: '解方程：2(x + 3) = 20', answer: 7,
      hint: '把 (x + 3) 看成一个整体，先两边除以 2。',
      explanation: '两边同时除以 2，得到 x + 3 = 10；再同时减 3，得到 x = 7。检验：2 × (7 + 3) = 20。'
    },
    {
      level: '应用', type: 'choice', question: '每盒彩笔有 x 支，4 盒共有 36 支。下面哪个方程符合题意？',
      options: ['x + 4 = 36', '4x = 36', '36 − x = 4', 'x ÷ 4 = 36'], answer: '4x = 36',
      hint: '每盒的数量 × 盒数 = 总数量。',
      explanation: '每盒 x 支，4 盒就是 4 × x 支，简写成 4x，所以列方程 4x = 36，解得 x = 9。'
    },
    {
      level: '应用', type: 'input', question: '买一个书包付 100 元，找回 32 元。设书包价格为 x 元，x 是多少？', answer: 68,
      hint: '书包价格 + 找回的钱 = 付出的 100 元，可列 x + 32 = 100。',
      explanation: '根据“书包价格 + 找回的钱 = 付出的钱”，列方程 x + 32 = 100。两边减 32，得到 x = 68。检验：68 + 32 = 100。'
    },
    {
      level: '挑战', type: 'choice', question: '下面哪个数是方程 2x + 6 = 18 的解？',
      options: ['x = 4', 'x = 5', 'x = 6', 'x = 8'], answer: 'x = 6',
      hint: '先两边减 6，再两边除以 2；也可以把选项逐一代入。',
      explanation: '2x + 6 = 18，两边减 6 得 2x = 12，再除以 2 得 x = 6。检验：2 × 6 + 6 = 18。'
    }
  ];
  var quizIndex = 0;
  var quizState = questions.map(function () { return { answered: false, correct: false, attempts: 0 }; });
  var explanationOpen = false;

  function updateQuizSummary() {
    var answered = quizState.filter(function (item) { return item.answered; }).length;
    var correct = quizState.filter(function (item) { return item.correct; }).length;
    $('#quiz-summary').textContent = '已答 ' + answered + ' / ' + questions.length + ' · 答对 ' + correct;
    $('#quiz-progress-bar').style.width = (answered / questions.length * 100) + '%';
    $$('.quiz-dot').forEach(function (dot, index) {
      dot.classList.toggle('is-current', index === quizIndex);
      dot.classList.toggle('is-correct', quizState[index].correct);
      dot.classList.toggle('is-answered', quizState[index].answered && !quizState[index].correct);
      dot.setAttribute('aria-label', '第 ' + (index + 1) + ' 题' + (quizState[index].correct ? '，已答对' : ''));
    });
  }

  function renderQuestion() {
    var item = questions[quizIndex];
    var state = quizState[quizIndex];
    explanationOpen = false;
    $('#quiz-level').textContent = item.level;
    $('#quiz-number').textContent = '第 ' + (quizIndex + 1) + ' 题';
    $('#quiz-question').textContent = item.question;
    $('#quiz-feedback').textContent = '';
    $('#quiz-feedback').className = 'quiz-feedback';
    $('#quiz-explanation').hidden = true;
    $('#quiz-explanation').textContent = item.explanation;
    $('#quiz-hint-text').hidden = true;
    $('#quiz-hint-text').textContent = item.hint;
    $('#quiz-explain').textContent = '查看解析';
    var answerArea = $('#quiz-answer-area');
    if (item.type === 'input') {
      answerArea.innerHTML = '<label class="answer-label" for="quiz-answer">x =</label><input id="quiz-answer" class="answer-input" type="number" inputmode="decimal" step="any" autocomplete="off" placeholder="写下答案"><span class="answer-unit">填一个数</span>';
      $('#quiz-answer').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') checkAnswer();
      });
    } else {
      answerArea.innerHTML = '<div class="choice-grid" role="group" aria-label="答案选项">' + item.options.map(function (option) {
        return '<button class="choice-button" type="button" data-answer="' + option + '">' + option + '</button>';
      }).join('') + '</div>';
      $$('.choice-button', answerArea).forEach(function (button) {
        button.addEventListener('click', function () {
          $$('.choice-button', answerArea).forEach(function (other) { other.classList.remove('is-selected'); });
          button.classList.add('is-selected');
          answerArea.dataset.selected = button.dataset.answer;
        });
      });
    }
    answerArea.dataset.selected = '';
    $('#quiz-prev').disabled = quizIndex === 0;
    $('#quiz-next').textContent = quizIndex === questions.length - 1 ? '回到第 1 题' : '下一题';
    updateQuizSummary();
    if (state.correct) {
      $('#quiz-feedback').textContent = '这一题已经答对了，可以再练习一次巩固。';
      $('#quiz-feedback').classList.add('is-correct');
    }
  }

  function checkAnswer() {
    var item = questions[quizIndex];
    var state = quizState[quizIndex];
    var answerArea = $('#quiz-answer-area');
    var value = item.type === 'input' ? $('#quiz-answer').value.trim() : answerArea.dataset.selected;
    var feedback = $('#quiz-feedback');
    if (!value) {
      feedback.textContent = item.type === 'input' ? '请先写下你的答案，再提交。' : '请先选择一个答案。';
      feedback.className = 'quiz-feedback is-wrong';
      return;
    }
    var correct = item.type === 'input' ? Number(value) === item.answer : value === item.answer;
    state.answered = true;
    state.attempts += 1;
    if (correct) {
      state.correct = true;
      feedback.textContent = '回答正确！记得说出每一步的依据。';
      feedback.className = 'quiz-feedback is-correct';
      explanationOpen = true;
      $('#quiz-explanation').hidden = false;
      $('#quiz-explain').textContent = '收起解析';
    } else {
      feedback.textContent = '这次还不对。对照提示检查运算方向，再试一次。';
      feedback.className = 'quiz-feedback is-wrong';
    }
    updateQuizSummary();
  }

  if ($('#quiz-submit')) {
    $('#quiz-submit').addEventListener('click', checkAnswer);
    $('#quiz-hint').addEventListener('click', function () {
      var hint = $('#quiz-hint-text');
      hint.hidden = !hint.hidden;
      $('#quiz-hint').textContent = hint.hidden ? '给我提示' : '收起提示';
    });
    $('#quiz-explain').addEventListener('click', function () {
      explanationOpen = !explanationOpen;
      $('#quiz-explanation').hidden = !explanationOpen;
      $('#quiz-explain').textContent = explanationOpen ? '收起解析' : '查看解析';
    });
    $('#quiz-prev').addEventListener('click', function () {
      if (quizIndex > 0) quizIndex -= 1;
      $('#quiz-hint').textContent = '给我提示';
      renderQuestion();
    });
    $('#quiz-next').addEventListener('click', function () {
      quizIndex = (quizIndex + 1) % questions.length;
      $('#quiz-hint').textContent = '给我提示';
      renderQuestion();
    });
    var quizNav = $('#quiz-dots');
    questions.forEach(function (_, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-dot';
      button.textContent = index + 1;
      button.addEventListener('click', function () {
        quizIndex = index;
        $('#quiz-hint').textContent = '给我提示';
        renderQuestion();
      });
      quizNav.appendChild(button);
    });
    renderQuestion();
  }

  // Self-assessment checklist
  var checklist = $$('.self-check input[type="checkbox"]');
  function updateChecklist() {
    var count = checklist.filter(function (box) { return box.checked; }).length;
    $('#checklist-status').textContent = count === checklist.length
      ? '全部完成！可以试着出一道题考考别人。'
      : '已完成 ' + count + ' / ' + checklist.length + ' 项';
  }
  checklist.forEach(function (box) { box.addEventListener('change', updateChecklist); });
  if (checklist.length) updateChecklist();
})();
