export function analyzeJudge0Statuses(outputs: any[]): {
    hasCriticalError: boolean;
    primaryError: string;
    errorDetails: string;
    testCaseDetails: any[];
} {
    const testCaseDetails = outputs.map((output, index) => ({
        testCase: index + 1,
        status: output.status?.description || 'Unknown',
        statusId: output.status?.id || 0,
        time: output.time || '0.000',
        memory: output.memory || 0,
        message: output.message || null,
        stderr: output.stderr || null,
        compile_output: output.compile_output || null
    }));

    // Check for critical errors
    for (const output of outputs) {
        const statusId = output.status?.id;
        
        if (!statusId) {
            return {
                hasCriticalError: true,
                primaryError: 'IE',
                errorDetails: 'Invalid response from code evaluation service',
                testCaseDetails
            };
        }
        
        // Compilation Error
        if (statusId === 6) {
            return {
                hasCriticalError: true,
                primaryError: 'CE',
                errorDetails: 'Compilation Error: ' + (output.compile_output || output.message || 'Check your code syntax'),
                testCaseDetails
            };
        }
        
        // Runtime Errors (status 7-12)
        if (statusId >= 7 && statusId <= 12) {
            // const errorType = getRuntimeErrorType(statusId);
            const errorMsg = output.stderr || output.message || output.compile_output || 'Error during execution';
            
            // Truncate very long error messages
            const truncatedError = errorMsg.length > 500 
                ? errorMsg.substring(0, 500) + '...' 
                : errorMsg;
            
            return {
                hasCriticalError: true,
                primaryError: 'RTE',
                errorDetails: `Runtime Error : ${truncatedError}`,
                testCaseDetails
            };
        }
        
        // Time Limit Exceeded
        if (statusId === 5) {
            return {
                hasCriticalError: true,
                primaryError: 'TLE',
                errorDetails: 'Time Limit Exceeded: Your code took too long to execute',
                testCaseDetails
            };
        }
        
        // Internal Error in Judge0
        if (statusId === 13) {
            return {
                hasCriticalError: true,
                primaryError: 'IE',
                errorDetails: 'Internal Error: Code evaluation service issue',
                testCaseDetails
            };
        }
    }

    return {
        hasCriticalError: false,
        primaryError: '',
        errorDetails: '',
        testCaseDetails
    };
}

// Update calculateStatistics to handle edge cases
export function calculateStatistics(outputs: any[], totalTestCases: number): {
    passed: number;
    total: number;
    wrong: number;
    avgTime: number;
    avgMemory: number;
    warnings: string[];
} {
    let correct = 0;
    let totalTime = 0;
    let totalMemory = 0;
    let wrong = 0;
    const warnings: string[] = [];
    let validExecutions = 0;

    for (const output of outputs) {
        const statusId = output.status?.id || 0;
        
        // Count correct answers
        if (statusId === 3) {
            correct++;
        } else if (statusId === 4) {
            wrong++;
        }
        
        // Only calculate averages for successful executions
        if (statusId === 3) {
            const time = parseFloat(output.time) || 0;
            const memory = parseInt(output.memory) || 0;
            
            totalTime += time;
            totalMemory += memory;
            validExecutions++;
        }

        // Check for performance warnings
        const time = parseFloat(output.time) || 0;
        const memory = parseInt(output.memory) || 0;
        
        if (time >= 1) {
            warnings.push('TLE: Some test cases are approaching time limit');
        }
        
        if (memory > 256000) {
            warnings.push('High memory usage detected');
        }
    }

    const avgTime = validExecutions > 0 ? totalTime / validExecutions : 0;
    const avgMemory = validExecutions > 0 ? totalMemory / validExecutions : 0;

    return {
        passed: correct,
        total: totalTestCases,
        wrong: wrong,
        avgTime: parseFloat(avgTime.toFixed(3)),
        avgMemory: parseFloat(avgMemory.toFixed(0)),
        warnings: warnings.length > 0 ? [...new Set(warnings)] : []
    };
}