let originalText = '';

document.getElementById('load-url-btn').addEventListener('click', () => {
  const imageUrl = document.getElementById('image-url').value;
  if (imageUrl) {
    loadImage(imageUrl);
  }
});

document.getElementById('image-input').addEventListener('change', () => {
  const file = document.getElementById('image-input').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(reader.result);
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('copy-btn').addEventListener('click', () => {
  const text = document.getElementById('translated-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert('클립보드에 복사되었습니다.');
  });
});

document.getElementById('reset-text-btn').addEventListener('click', () => {
  document.getElementById('extracted-text').value = originalText;
  translateText(originalText);
});

function loadImage(src) {
  const img = document.getElementById('image-preview');
  img.src = src;
  img.style.display = 'block';

  recognizeText(src);
}

function recognizeText(imageSrc) {
  const extractedEl = document.getElementById('extracted-text');
  extractedEl.value = '텍스트 추출중...';

  Tesseract.recognize(
    imageSrc,
    'eng+kor+jpn',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    originalText = text;
    const cleanedText = text.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s.,!?]/g, '');
    extractedEl.value = cleanedText;
    translateText(cleanedText);
  }).catch(err => {
    extractedEl.value = '텍스트 감지 중 오류가 발생했습니다.';
    console.error('텍스트 감지 오류:', err);
  });
}

function translateText(text) {
  const from = document.getElementById('detected-lang').value;
  const to = document.getElementById('target-lang').value;
  const resultBox = document.getElementById('translated-text');

  resultBox.innerText = '';
  resultBox.classList.remove('placeholder');

  fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const translated = data[0].map(item => item[0]).join('');
      resultBox.innerText = translated || '';
      if (!translated.trim()) {
        resultBox.innerText = '번역 결과가 없습니다.';
        resultBox.classList.add('placeholder');
      }
    })
    .catch(err => {
      resultBox.innerText = `번역 중 오류 발생: ${err.message}`;
      resultBox.classList.add('placeholder');
      console.error('번역 오류:', err);
    });
}
