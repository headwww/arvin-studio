import through from 'through2';
import File from 'vinyl';

/**
 * 创建一个同步的 Gulp 插件 transform stream
 * @param fn 同步转换函数，接收文件原始内容字符串和 vinyl File 对象，返回转换后的字符串
 * @returns through2 transform stream，在 buffer 模式下将文件内容传入 fn 处理后替换
 */
export const createTransformStream = (
  fn: (raw: string, file: File) => string,
) =>
  through.obj((file: File, encoding: any, done: any) => {
    if (file.isBuffer()) {
      const before = file.contents.toString(encoding);
      try {
        const after = fn(before, file);
        file.contents = Buffer.from(after);
        done(null, file);
      } catch (error) {
        done(error, null);
      }
    } else {
      // 非 buffer 模式的文件（如 stream）原样透传
      done(null, file);
    }
  });

/**
 * 创建一个异步的 Gulp 插件 transform stream
 * @param fn 异步转换函数，接收文件原始内容字符串和 vinyl File 对象，返回 Promise<string>
 * @returns through2 transform stream，在 buffer 模式下将文件内容传入 fn 处理后替换
 */
export const createTransformStreamAsync = (
  fn: (raw: string, file: File) => Promise<string>,
) =>
  through.obj((file: File, encoding: any, done: any) => {
    if (file.isBuffer()) {
      const before = file.contents.toString(encoding);
      fn(before, file)
        .then((after) => {
          file.contents = Buffer.from(after);
          done(null, file);
        })
        .catch((error) => {
          done(error, null);
        });
    } else {
      // 非 buffer 模式的文件（如 stream）原样透传
      done(null, file);
    }
  });
