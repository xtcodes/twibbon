let shareData = {
        title: 'Twibbon',
        text: 'This is a website where you can add photos to frames.',
        url: 'https://xtcodes.github.io/twibbon/',
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
            resultPara.textContent = 'Twibbon shared successfully'
          )
          .catch((e) =>
            resultPara.textContent = 'Error: ' + e
          )
      });
