import rl from 'readline';
import fs from 'fs';

const output = fs.createWriteStream(process.argv[3]);

const destroyOutputFile = () => {
  try {
    fs.unlinkSync(process.argv[3]);
  // eslint-disable-next-line no-empty
  } catch {}
};

const getIM = (current) => {
  const currentArray = current.split('');
  if (currentArray.length !== 4 || !currentArray.every((e) => (e === '1' || e === '0'))) {
    throw new Error(`Invalid input`);
  }
  return currentArray.reverse().join('');
};

const MOV_A_B = () => {
  output.write('00010000');
};

const MOV_A_IM = ([current]) => {
  output.write(`0011${getIM(current)}`);
};

const MOV_A = ([current]) => {
  switch (current) {
    case 'B':
      MOV_A_B();
      break;
    default:
      MOV_A_IM([current]);
  }
};

const MOV_B_A = () => {
  output.write('01000000');
};

const MOV_B_IM = ([current]) => {
  output.write(`0111${getIM(current)}`);
};

const MOV_B = ([current, ...nextData]) => {
  switch (current) {
    case 'A':
      MOV_B_A();
      break;
    default:
      MOV_B_IM([...nextData]);
  }
};

const MOV = ([current, ...nextData]) => {
  switch (current) {
    case 'A':
      MOV_A(nextData);
      break;
    case 'B':
      MOV_B(nextData);
      break;
    default:
      throw new Error(`Invalid input`);
  }
};

const ADD_A = ([current]) => {
  output.write(`0000${getIM(current)}`);
};

const ADD_B = ([current]) => {
  output.write(`0101${getIM(current)}`);
};

const ADD = ([current, ...nextData]) => {
  switch (current) {
    case 'A':
      ADD_A(nextData);
      break;
    case 'B':
      ADD_B(nextData);
      break;
    default:
      throw new Error(`Invalid input`);
  }
};

const IN_A = () => {
  output.write('00100000');
};

const IN_B = () => {
  output.write('01100000');
};

const IN = ([current]) => {
  switch (current) {
    case 'A':
      IN_A();
      break;
    case 'B':
      IN_B();
      break;
    default:
      throw new Error(`Invalid input`);
  }
};

const OUT_B = () => {
  output.write('10010000');
};

const OUT = ([current]) => {
  switch (current) {
    case 'B':
      OUT_B();
      break;
    default:
      output.write(`1011${getIM(current)}`);
  }
};

const JMP = ([current]) => {
  output.write(`1111${getIM(current)}`);
};

const JNC = ([current]) => {
  output.write(`1110${getIM(current)}`);
};

const analyze = ([current, ...nextData]) => {
  switch (current) {
    case 'MOV':
      MOV(nextData);
      break;
    case 'ADD':
      ADD(nextData);
      break;
    case 'IN':
      IN(nextData);
      break;
    case 'OUT':
      OUT(nextData);
      break;
    case 'JMP':
      JMP(nextData);
      break;
    case 'JNC':
      JNC(nextData);
      break;
    default:
      throw new Error(`Invalid input`);
  }
};

const input = fs.createReadStream(process.argv[2]);
{
  let lineCount = 1;

  for await (const line of rl.createInterface({ input })) {
    console.clear();
    console.log(`processing: ${line} at line ${lineCount}`);
    const words = line.toUpperCase().split(/[\s,]+/);
    try {
      analyze(words);
      output.write(`;${line}\n`);
    } catch (err) {
      destroyOutputFile();
      throw new Error(`${err.message} at line ${lineCount} : [${line}]`);
    }
    lineCount += 1;
  }
  console.clear();
  console.log('finished');
}
