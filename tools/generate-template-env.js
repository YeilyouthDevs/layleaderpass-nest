const fs = require('fs');
const path = require('path');

// .env 파일 경로와 생성할 template 파일 경로
const envFilePath = path.join(__dirname, '../.env');
const templateFilePath = path.join(__dirname, '../template.env');

// .env 파일 읽기
fs.readFile(envFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading .env file:', err);
        return;
    }

    // 값 제거: "KEY=VALUE"를 "KEY=" 형식으로 변환
    const templateData = data
        .split('\n')
        .map(line => {
            // 주석 또는 빈 줄은 그대로 유지
            if (line.trim() === '' || line.trim().startsWith('#')) {
                return line;
            }

            // "KEY=VALUE" -> "KEY="
            const [key] = line.split('=');
            return `${key}=`;
        })
        .join('\n');

    // template.env 파일 쓰기
    fs.writeFile(templateFilePath, templateData, 'utf8', writeErr => {
        if (writeErr) {
            console.error('Error writing template.env file:', writeErr);
            return;
        }

        console.log('template.env file created successfully.');
    });
});
