document.addEventListener('DOMContentLoaded', function(){
  // Waveform simple animation
  const path = document.getElementById('wave-path');
  if (path){
    let offset = 0;
    setInterval(()=>{
      offset = (offset + 2) % 1000;
      path.style.transform = `translateX(${(offset/10)-50}px)`;
    }, 80);
  }

  // Predict form
  const form = document.getElementById('predict-form');
  if (form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fileInput = document.getElementById('ecgfile');
      if (!fileInput.files.length) return alert('Choose a file first');

      const fd = new FormData();
      fd.append('ecgfile', fileInput.files[0]);

      const btn = form.querySelector('button');
      btn.disabled = true; btn.textContent = 'Uploading...';

      try{
        const res = await fetch('/api/predict', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok){
          document.getElementById('pred-class').textContent = data.predictedClass;
          document.getElementById('pred-conf').textContent = data.confidence;
          document.getElementById('pred-file').textContent = data.filename;
          document.getElementById('prediction-result').style.display = 'block';
        } else {
          alert(data.error || 'Prediction failed');
        }
      }catch(err){
        console.error(err);alert('Upload error');
      } finally{
        btn.disabled = false; btn.textContent = 'Upload & Predict';
      }
    });
  }

    // Results page: generate sample data and refresh
    const generateBtn = document.getElementById('generate-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const predContainer = document.getElementById('predictions-container');

    async function fetchAndRenderPredictions(){
      if (!predContainer) return;
      predContainer.innerHTML = '<p>Loading...</p>';
      try{
        const res = await fetch('/api/predictions');
        const list = await res.json();
        if (!Array.isArray(list) || list.length === 0){
          predContainer.innerHTML = '<p>No predictions yet. Upload an ECG to get started.</p>';
          return;
        }
        const html = list.map(p => {
          return `
            <div class="prediction-row">
              <div><strong>${p.filename}</strong></div>
              <div>${p.predictedClass}</div>
              <div>${p.confidence}</div>
              <div>${new Date(p.uploadDate).toLocaleString()}</div>
            </div>`;
        }).join('');
        predContainer.innerHTML = html;
      }catch(err){
        console.error(err);
        predContainer.innerHTML = '<p>Error loading predictions</p>';
      }
    }

    if (generateBtn){
      generateBtn.addEventListener('click', async ()=>{
        const countInput = document.getElementById('generate-count');
        let count = parseInt(countInput.value) || 10;
        if (count < 1) count = 1;
        if (count > 500) count = 500;
        generateBtn.disabled = true; generateBtn.textContent = 'Generating...';
        try{
          const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ count }) });
          const data = await res.json();
          if (res.ok){
            await fetchAndRenderPredictions();
            alert(`Created ${data.created || data.created} sample records.`);
          } else {
            alert(data.error || 'Failed to generate data');
          }
        }catch(err){
          console.error(err); alert('Error generating data');
        } finally{
          generateBtn.disabled = false; generateBtn.textContent = 'Generate Data';
        }
      });
    }

    if (refreshBtn){
      refreshBtn.addEventListener('click', async ()=>{
        refreshBtn.disabled = true; refreshBtn.textContent = 'Refreshing...';
        await fetchAndRenderPredictions();
        refreshBtn.disabled = false; refreshBtn.textContent = 'Refresh';
      });
    }

    // Auto-refresh predictions on Results page load
    if (predContainer){
      fetchAndRenderPredictions();
    }
});
