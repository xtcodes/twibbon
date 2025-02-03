let shareData = {
        title: 'Twibbon',
        text: 'Learn web development on MDN!',
        url: 'https://developer.mozilla.org',
      };

      const btn = document.querySelector('button');
      const resultPara = document.querySelector('.result');

      btn.addEventListener('click', () => {
        if (!navigator.canShare) {
          resultPara.textContent = 'Web Share API not available';
          return;
        }
        if (!navigator.canShare(shareData)) {
          resultPara.textContent = 'Share data unsupported, disallowed, or invalid';
          return;
        }
        navigator.share(shareData)
          .then(() =>
            resultPara.textContent = 'MDN shared successfully'
          )
          .catch((e) =>
            resultPara.textContent = 'Error: ' + e
          )
      });
