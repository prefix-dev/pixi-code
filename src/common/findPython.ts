import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

export async function findPythonExecutable(envPath: string): Promise<string | null> {
    let candidates;

    if (os.platform() === 'win32') {
        candidates = [
            path.join(envPath, 'Scripts', 'python.exe'),
            path.join(envPath, 'Scripts', 'python3.exe'),
            path.join(envPath, 'bin', 'python.exe'),
            path.join(envPath, 'bin', 'python3.exe'),
            path.join(envPath, 'python.exe'),
            path.join(envPath, 'python3.exe'),
        ];
    } else {
        candidates = [
            path.join(envPath, 'bin', 'python'),
            path.join(envPath, 'bin', 'python3'),
            path.join(envPath, 'python'),
            path.join(envPath, 'python3'),
        ];
    }

    for (const candidate of candidates) {
        if (await fs.pathExists(candidate)) {
            return candidate;
        }
    }

    for (const dir of [path.join(envPath, 'Scripts'), path.join(envPath, 'bin'), envPath]) {
        if (!(await fs.pathExists(dir))) {
            continue;
        }

        const versionedPython = (await fs.readdir(dir))
            .sort()
            .find((name) => /^python(\d+(\.\d+)*)?(\.exe)?$/.test(name));

        if (versionedPython) {
            return path.join(dir, versionedPython);
        }
    }

    return null;
}
