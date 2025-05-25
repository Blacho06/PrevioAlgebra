// Variables globales
let matrixSize = 2;
let currentMethod = "gaussian";

// Inicialización de la página
document.addEventListener('DOMContentLoaded', function() {
    generateMatrix();
    updateMethodInfo();
});

// Función para generar la matriz de entrada según el tamaño seleccionado
function generateMatrix() {
    matrixSize = parseInt(document.getElementById('size').value);
    const matrixInputs = document.getElementById('matrix-inputs');
    matrixInputs.innerHTML = '';
    
    const table = document.createElement('table');
    
    for (let i = 0; i < matrixSize; i++) {
        const row = document.createElement('tr');
        
        for (let j = 0; j < matrixSize; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'coefficient-input';
            input.id = `a${i}${j}`;
            input.placeholder = '0';
            cell.appendChild(input);
            
            if (j < matrixSize - 1) {
                const varLabel = document.createElement('span');
                varLabel.className = 'variable-label';
                varLabel.textContent = `x${j + 1}`;
                cell.appendChild(varLabel);
                
                if (j < matrixSize - 1) {
                    const plusSign = document.createElement('span');
                    plusSign.textContent = ' + ';
                    cell.appendChild(plusSign);
                }
            }
            
            row.appendChild(cell);
        }
        
        // Agregar el signo igual
        const equalsCell = document.createElement('td');
        const equalsSign = document.createElement('span');
        equalsSign.className = 'equals-sign';
        equalsSign.textContent = '=';
        equalsCell.appendChild(equalsSign);
        row.appendChild(equalsCell);
        
        // Agregar el término independiente
        const constantCell = document.createElement('td');
        const constantInput = document.createElement('input');
        constantInput.type = 'text';
        constantInput.className = 'coefficient-input';
        constantInput.id = `b${i}`;
        constantInput.placeholder = '0';
        constantCell.appendChild(constantInput);
        row.appendChild(constantCell);
        
        table.appendChild(row);
    }
    
    matrixInputs.appendChild(table);
}
// Función para actualizar la información del método seleccionado
function updateMethodInfo() {
    currentMethod = document.getElementById('method').value;
    
    // Ocultar todas las secciones de método
    const methodSections = document.querySelectorAll('.edu-section:not(.general-info)');
    methodSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección del método seleccionado
    const selectedSection = document.getElementById(`method-info-${currentMethod}`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}
// Funciones auxiliares para cálculos matemáticos
function parseInput(value) {
    if (!value || value.trim() === '') return 0;
    
    // Comprobar si es una fracción
    if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0].trim());
            const denominator = parseFloat(parts[1].trim());
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                return numerator / denominator;
            }
        }
    }
    
    // Intentar convertir a número
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

function formatNumber(number) {
    if (Math.abs(number) < 1e-10) return '0';
    
    // Redondear para evitar problemas de precisión
    number = parseFloat(number.toFixed(10));
    
    // Si es un número entero, mostrarlo como tal
    if (Number.isInteger(number)) return number.toString();
    
    // Intentar representarlo como fracción si es "limpio"
    const fraction = toFraction(number);
    if (fraction.denominator !== 1 && fraction.denominator <= 100) {
        return `${fraction.numerator}/${fraction.denominator}`;
    }
    
    // En otro caso, mostrarlo como decimal
    return number.toFixed(4).replace(/\.?0+$/, '');
}

function toFraction(decimal) {
    const tolerance = 1.0E-10;
    let sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);
    
    // Para números muy pequeños
    if (decimal < tolerance) {
        return { numerator: 0, denominator: 1 };
    }
    
    // Para números enteros
    if (Math.abs(decimal - Math.round(decimal)) < tolerance) {
        return { numerator: sign * Math.round(decimal), denominator: 1 };
    }
    
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let y = decimal;
    let a, aux;
    
    // Algoritmo de fracciones continuas
    do {
        a = Math.floor(y);
        y = y - a;
        
        aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        
        y = 1 / y;
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance && k1 < 1000);
    
    return { numerator: sign * h1, denominator: k1 };
}

function determinant(matrix) {
    const n = matrix.length;
    
    // Caso base para matriz 1x1
    if (n === 1) return matrix[0][0];
    
    // Caso base para matriz 2x2
    if (n === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    let det = 0;
    
    // Desarrollo de Laplace a lo largo de la primera fila
    for (let j = 0; j < n; j++) {
        det += Math.pow(-1, j) * matrix[0][j] * determinant(getSubmatrix(matrix, 0, j));
    }
    
    return det;
}

function getSubmatrix(matrix, row, col) {
    const n = matrix.length;
    const submatrix = [];
    
    for (let i = 0; i < n; i++) {
        if (i === row) continue;
        
        const subrow = [];
        for (let j = 0; j < n; j++) {
            if (j === col) continue;
            subrow.push(matrix[i][j]);
        }
        
        submatrix.push(subrow);
    }
    
    return submatrix;
}

function matrixInverse(matrix) {
    const n = matrix.length;
    const det = determinant(matrix);
    
    // Si el determinante es cero, la matriz no tiene inversa
    if (Math.abs(det) < 1e-10) return null;
    
    // Calcular la matriz de cofactores
    const cofactorMatrix = [];
    for (let i = 0; i < n; i++) {
        cofactorMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            const sign = Math.pow(-1, i + j);
            const subDet = determinant(getSubmatrix(matrix, i, j));
            cofactorMatrix[i][j] = sign * subDet;
        }
    }
    
    // Calcular la matriz adjunta (transpuesta de la matriz de cofactores)
    const adjointMatrix = [];
    for (let i = 0; i < n; i++) {
        adjointMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            adjointMatrix[i][j] = cofactorMatrix[j][i];
        }
    }
    
    // Calcular la matriz inversa
    const inverseMatrix = [];
    for (let i = 0; i < n; i++) {
        inverseMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            inverseMatrix[i][j] = adjointMatrix[i][j] / det;
        }
    }
    
    return inverseMatrix;
}

function matrixMultiply(A, B) {
    const result = [];
    
    // Si B es un vector (matriz de una columna)
    if (!Array.isArray(B[0])) {
        for (let i = 0; i < A.length; i++) {
            let sum = 0;
            for (let j = 0; j < A[0].length; j++) {
                sum += A[i][j] * B[j];
            }
            result.push(sum);
        }
    } else {
        // Si B es una matriz
        for (let i = 0; i < A.length; i++) {
            result[i] = [];
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < A[0].length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
    }
    
    return result;
}// Funciones para mostrar matrices y resultados
function formatMatrix(matrix, withBrackets = true) {
    let result = '';
    const rows = matrix.length;
    let cols = Array.isArray(matrix[0]) ? matrix[0].length : 1;
    
    // En caso de que sea un vector
    if (!Array.isArray(matrix[0])) {
        // Convertir vector a matriz de una columna
        const matrixColumn = [];
        for (let i = 0; i < rows; i++) {
            matrixColumn.push([matrix[i]]);
        }
        return formatMatrix(matrixColumn, withBrackets);
    }
    
    // Encontrar la anchura máxima para cada columna
    const widths = [];
    for (let j = 0; j < cols; j++) {
        let maxWidth = 0;
        for (let i = 0; i < rows; i++) {
            const cellStr = formatNumber(matrix[i][j]).toString();
            maxWidth = Math.max(maxWidth, cellStr.length);
        }
        widths.push(maxWidth);
    }
    
    for (let i = 0; i < rows; i++) {
        if (withBrackets) {
            result += '│ ';
        } else {
            result += '  ';
        }
        
        for (let j = 0; j < cols; j++) {
            const value = formatNumber(matrix[i][j]);
            const padding = ' '.repeat(widths[j] - value.toString().length);
            result += padding + value;
            if (j < cols - 1) result += '  ';
        }
        
        if (withBrackets) {
            result += ' │';
        }
        
        if (i < rows - 1) result += '\n';
    }
    
    return result;
}

function formatAugmentedMatrix(A, b) {
    let result = '';
    const rows = A.length;
    const cols = A[0].length;
    
    // Encontrar la anchura máxima para cada columna de A
    const widthsA = [];
    for (let j = 0; j < cols; j++) {
        let maxWidth = 0;
        for (let i = 0; i < rows; i++) {
            const cellStr = formatNumber(A[i][j]).toString();
            maxWidth = Math.max(maxWidth, cellStr.length);
        }
        widthsA.push(maxWidth);
    }
    
    // Encontrar la anchura máxima para b
    let maxWidthB = 0;
    for (let i = 0; i < rows; i++) {
        const cellStr = formatNumber(b[i]).toString();
        maxWidthB = Math.max(maxWidthB, cellStr.length);
    }
    
    for (let i = 0; i < rows; i++) {
        result += '│ ';
        
        // Matriz A
        for (let j = 0; j < cols; j++) {
            const value = formatNumber(A[i][j]);
            const padding = ' '.repeat(widthsA[j] - value.toString().length);
            result += padding + value;
            if (j < cols - 1) result += '  ';
        }
        
        // Línea vertical
        result += ' │ ';
        
        // Vector b
        const value = formatNumber(b[i]);
        const padding = ' '.repeat(maxWidthB - value.toString().length);
        result += padding + value;
        
        result += ' │';
        if (i < rows - 1) result += '\n';
    }
    
    return result;
}

function displayMatrixStep(stepDescription, A, b = null) {
    const stepsContainer = document.getElementById('solution-steps');
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    
    const descriptionP = document.createElement('p');
    descriptionP.innerHTML = stepDescription;
    stepDiv.appendChild(descriptionP);
    
    const matrixDiv = document.createElement('div');
    matrixDiv.className = 'matrix-display';
    
    if (b === null) {
        // Es una matriz simple
        matrixDiv.textContent = formatMatrix(A);
    } else {
        // Es una matriz aumentada
        matrixDiv.textContent = formatAugmentedMatrix(A, b);
    }
    
    stepDiv.appendChild(matrixDiv);
    stepsContainer.appendChild(stepDiv);
}

function displayCalculationStep(description, details = null) {
    const stepsContainer = document.getElementById('solution-steps');
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';
    
    const descriptionP = document.createElement('p');
    descriptionP.innerHTML = description;
    stepDiv.appendChild(descriptionP);
    
    if (details) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'calculation-detail';
        detailsDiv.innerHTML = details;
        stepDiv.appendChild(detailsDiv);
    }
    
    stepsContainer.appendChild(stepDiv);
}

function displaySolution(solution, type = 'unique') {
    const resultContainer = document.getElementById('solution-result');
    resultContainer.innerHTML = '';
    
    const titleH3 = document.createElement('h3');
    
    if (type === 'none') {
        titleH3.textContent = 'El sistema no tiene solución';
        titleH3.style.color = 'var(--accent-color)';
        resultContainer.appendChild(titleH3);
        return;
    }
    
    if (type === 'infinite') {
        titleH3.textContent = 'El sistema tiene infinitas soluciones';
        titleH3.style.color = 'var(--warning-color)';
        resultContainer.appendChild(titleH3);
        
        const descriptionP = document.createElement('p');
        descriptionP.textContent = 'Las soluciones pueden expresarse como:';
        resultContainer.appendChild(descriptionP);
        
        const solutionDiv = document.createElement('div');
        solutionDiv.innerHTML = solution;
        resultContainer.appendChild(solutionDiv);
        return;
    }
    
    titleH3.textContent = 'Solución del sistema';
    titleH3.style.color = 'var(--success-color)';
    resultContainer.appendChild(titleH3);
    
    const resultTable = document.createElement('table');
    resultTable.className = 'verification-table';
    
    const headerRow = document.createElement('tr');
    const headerCell = document.createElement('th');
    headerCell.textContent = 'Variable';
    headerRow.appendChild(headerCell);
    
    const valueCell = document.createElement('th');
    valueCell.textContent = 'Valor';
    headerRow.appendChild(valueCell);
    
    resultTable.appendChild(headerRow);
    
    for (let i = 0; i < solution.length; i++) {
        const row = document.createElement('tr');
        
        const varCell = document.createElement('td');
        varCell.textContent = `x${i+1}`;
        row.appendChild(varCell);
        
        const solCell = document.createElement('td');
        solCell.textContent = formatNumber(solution[i]);
        row.appendChild(solCell);
        
        resultTable.appendChild(row);
    }
    
    resultContainer.appendChild(resultTable);
}
function displayInfiniteSolutions(parameterizedSolution) {
    const resultContainer = document.getElementById('solution-result');
    resultContainer.innerHTML = '';
    
    const titleH3 = document.createElement('h3');
    titleH3.textContent = 'El sistema tiene infinitas soluciones';
    titleH3.style.color = 'var(--warning-color)';
    resultContainer.appendChild(titleH3);
    
    const descriptionP = document.createElement('p');
    descriptionP.textContent = 'Las soluciones pueden expresarse como:';
    resultContainer.appendChild(descriptionP);
    
    // Mostrar la expresión paramétrica
    const solutionDiv = document.createElement('div');
    solutionDiv.className = 'parametric-solution';
    solutionDiv.innerHTML = parameterizedSolution.expression;
    resultContainer.appendChild(solutionDiv);
    
    // Agregar input para validar valores específicos
    const validationDiv = document.createElement('div');
    validationDiv.className = 'parameter-validation';
    validationDiv.innerHTML = `
        <h4>Validar solución específica:</h4>
        <label for="parameter-value">Ingrese un valor para el parámetro t:</label>
        <input type="number" id="parameter-value" step="any" placeholder="Ej: 1, -2, 0.5">
        <button onclick="validateParameterValue()" style="width: auto; margin-left: 10px;">Validar</button>
        <div id="parameter-result" class="parameter-result"></div>
    `;
    resultContainer.appendChild(validationDiv);
    
    // Guardar la información paramétrica globalmente
    window.currentParametricSolution = parameterizedSolution;
}

// 2. AGREGAR FUNCIÓN PARA VALIDAR VALORES DEL PARÁMETRO

function validateParameterValue() {
    const parameterValue = parseFloat(document.getElementById('parameter-value').value);
    const resultDiv = document.getElementById('parameter-result');
    
    if (isNaN(parameterValue)) {
        resultDiv.innerHTML = '<p style="color: var(--accent-color);">Por favor, ingrese un valor numérico válido.</p>';
        return;
    }
    
    const parametricSol = window.currentParametricSolution;
    const specificSolution = [];
    
    // Calcular la solución específica sustituyendo el parámetro
    for (let i = 0; i < parametricSol.variables.length; i++) {
        const variable = parametricSol.variables[i];
        if (variable.isFree) {
            specificSolution[i] = parameterValue;
        } else {
            // Evaluar la expresión con el parámetro
            specificSolution[i] = variable.constant + variable.coefficient * parameterValue;
        }
    }
    
    // Mostrar la solución específica
    let solutionHTML = '<h5>Solución para t = ' + parameterValue + ':</h5>';
    solutionHTML += '<div class="specific-solution">';
    for (let i = 0; i < specificSolution.length; i++) {
        solutionHTML += `<p>x<sub>${i+1}</sub> = ${formatNumber(specificSolution[i])}</p>`;
    }
    solutionHTML += '</div>';
    
    // Verificar la solución
    const originalA = window.currentSystemMatrix;
    const originalB = window.currentSystemVector;
    
    if (originalA && originalB) {
        const isValid = verifySpecificSolution(originalA, originalB, specificSolution);
        if (isValid) {
            solutionHTML += '<p style="color: var(--success-color); font-weight: bold;">✓ Esta solución es válida</p>';
        } else {
            solutionHTML += '<p style="color: var(--accent-color); font-weight: bold;">✗ Esta solución no es válida</p>';
        }
    }
    
    resultDiv.innerHTML = solutionHTML;
}

// 3. AGREGAR FUNCIÓN PARA VERIFICAR SOLUCIÓN ESPECÍFICA

function verifySpecificSolution(A, b, solution) {
    const n = A.length;
    
    for (let i = 0; i < n; i++) {
        let leftSide = 0;
        for (let j = 0; j < n; j++) {
            leftSide += A[i][j] * solution[j];
        }
        
        if (Math.abs(leftSide - b[i]) > 1e-10) {
            return false;
        }
    }
    
    return true;
}


// Funciones para implementar los métodos de resolución
function solveSystem() {
    // Limpiar resultados anteriores
    document.getElementById('solution-steps').innerHTML = '';
    document.getElementById('solution-result').innerHTML = '';
    document.getElementById('verification-result').innerHTML = '';
    
    // Leer la matriz de coeficientes y el vector de términos independientes
    const A = [];
    const b = [];
    
    // Leer coeficientes
    for (let i = 0; i < matrixSize; i++) {
        A[i] = [];
        for (let j = 0; j < matrixSize; j++) {
            A[i][j] = parseInput(document.getElementById(`a${i}${j}`).value);
        }
        // Leer términos independientes
        b[i] = parseInput(document.getElementById(`b${i}`).value);
    }
    
    // Mostrar sistema original
    displayCalculationStep('Sistema original de ecuaciones:');
    displayMatrixStep('Matriz aumentada [A|b]:', A, b);
    
    // Resolver según el método seleccionado
    const method = document.getElementById('method').value;
    let solution;
    
   switch (method) {
    case 'gaussian':
        solution = solveByGaussianElimination(A, b);
        break;
    case 'gauss-jordan':
        solution = solveByGaussJordan(A, b);
        break;
    default:
        solution = solveByGaussianElimination(A, b);
}     solution = solveByGaussianElimination(A, b);
    }
    
    // Verificar la solución
    if (solution.type === 'unique') {
        verifySolution(A, b, solution.values);
    }


function solveByGaussianElimination(A, b) {
    // Clonar matrices para no modificar las originales
    const n = A.length;
    const augmentedA = [];
    const augmentedB = [];
    
    for (let i = 0; i < n; i++) {
        augmentedA[i] = [...A[i]];
        augmentedB[i] = b[i];
    }
    
    displayCalculationStep('Resolviendo por el método de Eliminación Gaussiana:');
    
    // Fase de eliminación hacia adelante
    displayCalculationStep('1. Fase de eliminación hacia adelante:');
    
    for (let k = 0; k < n - 1; k++) {
        // Pivoteo parcial
        let maxRow = k;
        let maxVal = Math.abs(augmentedA[k][k]);
        
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(augmentedA[i][k]) > maxVal) {
                maxVal = Math.abs(augmentedA[i][k]);
                maxRow = i;
            }
        }
        
        // Intercambiar filas si es necesario
        if (maxRow !== k) {
            [augmentedA[k], augmentedA[maxRow]] = [augmentedA[maxRow], augmentedA[k]];
            [augmentedB[k], augmentedB[maxRow]] = [augmentedB[maxRow], augmentedB[k]];
            
            displayCalculationStep(`Intercambiar fila ${k+1} con fila ${maxRow+1} para mejorar pivote:`);
            displayMatrixStep('Matriz aumentada después del intercambio:', augmentedA, augmentedB);
        }
        
        // Si el pivote es cero, el sistema puede ser singular
        if (Math.abs(augmentedA[k][k]) < 1e-10) {
            continue; // Pasar al siguiente pivote
        }
        
        // Eliminación
        for (let i = k + 1; i < n; i++) {
            const factor = augmentedA[i][k] / augmentedA[k][k];
            augmentedB[i] -= factor * augmentedB[k];
            
            for (let j = k; j < n; j++) {
                augmentedA[i][j] -= factor * augmentedA[k][j];
            }
            
            displayCalculationStep(`Eliminar x<sub>${k+1}</sub> de la ecuación ${i+1}:`);
            displayCalculationStep(`R<sub>${i+1}</sub> = R<sub>${i+1}</sub> - (${formatNumber(factor)}) × R<sub>${k+1}</sub>`);
            displayMatrixStep('Matriz aumentada tras eliminación:', augmentedA, augmentedB);
        }
    }
    
    // Comprobar si el sistema tiene solución única
    let hasUniqueSolution = true;
    
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            rowSum += Math.abs(augmentedA[i][j]);
        }
        
        // Si todos los coeficientes son cero pero el término independiente no lo es
        if (rowSum < 1e-10 && Math.abs(augmentedB[i]) > 1e-10) {
            displayCalculationStep('El sistema no tiene solución (inconsistente).');
            return { type: 'none' };
        }
        
        // Si todos los coeficientes y el término independiente son cero
        if (rowSum < 1e-10 && Math.abs(augmentedB[i]) < 1e-10) {
            hasUniqueSolution = false;
        }
    }
    
    // Si un pivote de la diagonal es cero, el sistema podría tener infinitas soluciones
    for (let i = 0; i < n; i++) {
        if (Math.abs(augmentedA[i][i]) < 1e-10) {
            hasUniqueSolution = false;
            break;
        }
    }
    
   if (!hasUniqueSolution) {
    displayCalculationStep('El sistema tiene infinitas soluciones.');
    
    // Guardar matrices originales para verificación
    window.currentSystemMatrix = A;
    window.currentSystemVector = b;
    
    // Generar expresión paramétrica
    const parametricSolution = generateParametricSolution(augmentedA, augmentedB);
    displayInfiniteSolutions(parametricSolution);
    
    return { type: 'infinite', parametric: parametricSolution };
}

// 5. AGREGAR FUNCIÓN PARA GENERAR SOLUCIÓN PARAMÉTRICA

function generateParametricSolution(A, b) {
    const n = A.length;
    const variables = [];
    
    // Identificar variables libres y dependientes
    let freeVariableIndex = -1;
    
    // Buscar la primera variable que puede ser libre
    for (let j = n - 1; j >= 0; j--) {
        let hasNonZero = false;
        for (let i = 0; i < n; i++) {
            if (Math.abs(A[i][j]) > 1e-10) {
                hasNonZero = true;
                break;
            }
        }
        if (!hasNonZero) {
            freeVariableIndex = j;
            break;
        }
    }
    
    // Si no encontramos una variable completamente libre, usar la última
    if (freeVariableIndex === -1) {
        freeVariableIndex = n - 1;
    }
    
    // Construir las expresiones para cada variable
    let expressionHTML = '<div class="parametric-expressions">';
    
    for (let i = 0; i < n; i++) {
        if (i === freeVariableIndex) {
            // Variable libre
            variables[i] = { isFree: true, constant: 0, coefficient: 1 };
            expressionHTML += `<p>x<sub>${i+1}</sub> = t (parámetro libre)</p>`;
        } else {
            // Variable dependiente - simplificación
            // En una implementación completa, aquí se haría back-substitution
            let constant = 0;
            let coefficient = 0;
            
            // Buscar una fila no nula para esta variable
            for (let row = 0; row < n; row++) {
                if (Math.abs(A[row][i]) > 1e-10) {
                    // Simplificación: asumir que podemos expresar en términos del parámetro
                    constant = b[row] / A[row][i];
                    if (Math.abs(A[row][freeVariableIndex]) > 1e-10) {
                        coefficient = -A[row][freeVariableIndex] / A[row][i];
                    }
                    break;
                }
            }
            
            variables[i] = { isFree: false, constant: constant, coefficient: coefficient };
            
            if (Math.abs(coefficient) < 1e-10) {
                expressionHTML += `<p>x<sub>${i+1}</sub> = ${formatNumber(constant)}</p>`;
            } else {
                const coeffStr = Math.abs(coefficient - 1) < 1e-10 ? '' : 
                                Math.abs(coefficient + 1) < 1e-10 ? '-' : 
                                formatNumber(coefficient);
                const sign = coefficient >= 0 ? '+' : '';
                
                if (Math.abs(constant) < 1e-10) {
                    expressionHTML += `<p>x<sub>${i+1}</sub> = ${coeffStr}t</p>`;
                } else {
                    expressionHTML += `<p>x<sub>${i+1}</sub> = ${formatNumber(constant)} ${sign} ${coeffStr}t</p>`;
                }
            }
        }
    }
    
    expressionHTML += '<p style="margin-top: 10px; font-style: italic;">donde t puede ser cualquier número real</p>';
    expressionHTML += '</div>';
    
    return {
        variables: variables,
        expression: expressionHTML,
        freeVariableIndex: freeVariableIndex
    };
}
    
    // Fase de sustitución hacia atrás
    displayCalculationStep('2. Fase de sustitución hacia atrás:');
    
    const solution = new Array(n).fill(0);
    
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += augmentedA[i][j] * solution[j];
        }
        
        solution[i] = (augmentedB[i] - sum) / augmentedA[i][i];
        
        displayCalculationStep(`Calcular x<sub>${i+1}</sub>:`, `x<sub>${i+1}</sub> = (${formatNumber(augmentedB[i])} - ${formatNumber(sum)}) / ${formatNumber(augmentedA[i][i])} = ${formatNumber(solution[i])}`);
    }
    
    displaySolution(solution, 'unique');
    return { type: 'unique', values: solution };
}// Método de Gauss-Jordan
function solveByGaussJordan(A, b) {
    // Clonar matrices para no modificar las originales
    const n = A.length;
    const augmentedA = [];
    const augmentedB = [];
    
    for (let i = 0; i < n; i++) {
        augmentedA[i] = [...A[i]];
        augmentedB[i] = b[i];
    }
    
    displayCalculationStep('Resolviendo por el método de Gauss-Jordan:');
    
    // Eliminación Gaussiana extendida
    for (let k = 0; k < n; k++) {
        // Pivoteo parcial
        let maxRow = k;
        let maxVal = Math.abs(augmentedA[k][k]);
        
        for (let i = k + 1; i < n; i++) {
            if (Math.abs(augmentedA[i][k]) > maxVal) {
                maxVal = Math.abs(augmentedA[i][k]);
                maxRow = i;
            }
        }
        
        // Intercambiar filas si es necesario
        if (maxRow !== k) {
            [augmentedA[k], augmentedA[maxRow]] = [augmentedA[maxRow], augmentedA[k]];
            [augmentedB[k], augmentedB[maxRow]] = [augmentedB[maxRow], augmentedB[k]];
            
            displayCalculationStep(`Intercambiar fila ${k+1} con fila ${maxRow+1} para mejorar pivote:`);
            displayMatrixStep('Matriz aumentada después del intercambio:', augmentedA, augmentedB);
        }
        
        // Si el pivote es cero, el sistema puede ser singular
        if (Math.abs(augmentedA[k][k]) < 1e-10) {
            continue; // Pasar al siguiente pivote
        }
        
        // Normalizar la fila del pivote
        const pivotValue = augmentedA[k][k];
        for (let j = k; j < n; j++) {
            augmentedA[k][j] /= pivotValue;
        }
        augmentedB[k] /= pivotValue;
        
        displayCalculationStep(`Normalizar la fila ${k+1} dividiendo por el pivote ${formatNumber(pivotValue)}:`);
        displayMatrixStep('Matriz aumentada después de normalizar:', augmentedA, augmentedB);
        
        // Eliminación hacia arriba y hacia abajo
        for (let i = 0; i < n; i++) {
            if (i !== k) {
                const factor = augmentedA[i][k];
                for (let j = k; j < n; j++) {
                    augmentedA[i][j] -= factor * augmentedA[k][j];
                }
                augmentedB[i] -= factor * augmentedB[k];
            }
        }
        
        displayCalculationStep(`Eliminar x<sub>${k+1}</sub> de todas las demás ecuaciones:`);
        displayMatrixStep('Matriz aumentada tras eliminación completa:', augmentedA, augmentedB);
    }
    
    // Comprobar si el sistema tiene solución única
    let hasUniqueSolution = true;
    
    for (let i = 0; i < n; i++) {
        let rowSum = 0;
        for (let j = 0; j < n; j++) {
            rowSum += Math.abs(augmentedA[i][j]);
        }
        
        // Si todos los coeficientes son cero pero el término independiente no lo es
        if (rowSum < 1e-10 && Math.abs(augmentedB[i]) > 1e-10) {
            displayCalculationStep('El sistema no tiene solución (inconsistente).');
            return { type: 'none' };
        }
        
        // Si todos los coeficientes y el término independiente son cero
        if (rowSum < 1e-10 && Math.abs(augmentedB[i]) < 1e-10) {
            hasUniqueSolution = false;
        }
    }
    
    if (!hasUniqueSolution) {
        displayCalculationStep('El sistema tiene infinitas soluciones.');
        let solutionText = 'Las soluciones dependen de parámetros libres.';
        
        return { type: 'infinite', expression: solutionText };
    }
    
    // Leer la solución directamente de la columna de términos independientes
    const solution = [...augmentedB];
    
    displayCalculationStep('La matriz está en forma escalonada reducida. La solución es:');
    for (let i = 0; i < n; i++) {
        displayCalculationStep(`x<sub>${i+1}</sub> = ${formatNumber(solution[i])}`);
    }
    
    displaySolution(solution, 'unique');
    return { type: 'unique', values: solution };
}

// Función para calcular el rango de una matriz
function calculateRank(matrix) {
    // Crear una copia de la matriz
    const n = matrix.length;
    const m = matrix[0].length;
    const A = [];
    
    for (let i = 0; i < n; i++) {
        A[i] = [...matrix[i]];
    }
    
    // Aplicar eliminación gaussiana
    let rank = 0;
    const rows = A.length;
    const cols = A[0].length;
    
    for (let r = 0; r < rows; r++) {
        if (r >= cols) break;
        
        // Encontrar la fila con el mayor elemento en la columna actual
        let i_max = r;
        let max_val = Math.abs(A[r][r]);
        
        for (let i = r + 1; i < rows; i++) {
            if (Math.abs(A[i][r]) > max_val) {
                i_max = i;
                max_val = Math.abs(A[i][r]);
            }
        }
        
        // Si el máximo elemento es cero, pasar a la siguiente columna
        if (Math.abs(A[i_max][r]) < 1e-10) {
            continue;
        }
        
        // Intercambiar filas
        if (i_max !== r) {
            [A[r], A[i_max]] = [A[i_max], A[r]];
        }
        
        // Eliminar
        for (let i = r + 1; i < rows; i++) {
            const factor = A[i][r] / A[r][r];
            for (let j = r; j < cols; j++) {
                A[i][j] -= factor * A[r][j];
            }
        }
        
        // Incrementar el rango
        rank++;
    }
    
    return rank;
}

function verifySolution(A, b, solution) {
    const n = A.length;
    const verificationResults = [];
    let allCorrect = true;
    
    const verificationContainer = document.getElementById('verification-result');
    verificationContainer.innerHTML = '';
    verificationContainer.className = 'verification';
    
    const titleH3 = document.createElement('h3');
    titleH3.textContent = 'Verificación de la solución';
    verificationContainer.appendChild(titleH3);
    
    const descriptionP = document.createElement('p');
    descriptionP.textContent = 'Comprobando que la solución satisface todas las ecuaciones:';
    verificationContainer.appendChild(descriptionP);
    
    const verificationTable = document.createElement('table');
    verificationTable.className = 'verification-table';
    
    const headerRow = document.createElement('tr');
    
    const eqHeaderCell = document.createElement('th');
    eqHeaderCell.textContent = 'Ecuación';
    headerRow.appendChild(eqHeaderCell);
    
    const leftHeaderCell = document.createElement('th');
    leftHeaderCell.textContent = 'Lado izquierdo';
    headerRow.appendChild(leftHeaderCell);
    
    const rightHeaderCell = document.createElement('th');
    rightHeaderCell.textContent = 'Lado derecho';
    headerRow.appendChild(rightHeaderCell);
    
    const resultHeaderCell = document.createElement('th');
    resultHeaderCell.textContent = 'Resultado';
    headerRow.appendChild(resultHeaderCell);
    
    verificationTable.appendChild(headerRow);
    
    for (let i = 0; i < n; i++) {
        // Calcular el lado izquierdo de la ecuación
        let leftSide = 0;
        let leftExpr = '';
        
        for (let j = 0; j < n; j++) {
            leftSide += A[i][j] * solution[j];
            
            if (A[i][j] !== 0) {
                if (leftExpr !== '') {
                    leftExpr += ' + ';
                }
                
                leftExpr += `${formatNumber(A[i][j])} × ${formatNumber(solution[j])}`;
            }
        }
        
        const rightSide = b[i];
        const isCorrect = Math.abs(leftSide - rightSide) < 1e-10;
        
        if (!isCorrect) {
            allCorrect = false;
        }
        
        verificationResults.push({
            equation: i + 1,
            leftSide: leftSide,
            rightSide: rightSide,
            isCorrect: isCorrect
        });
        
        const row = document.createElement('tr');
        
        const eqCell = document.createElement('td');
        eqCell.textContent = `Ecuación ${i + 1}`;
        row.appendChild(eqCell);
        
        const leftCell = document.createElement('td');
        leftCell.textContent = `${leftExpr} = ${formatNumber(leftSide)}`;
        row.appendChild(leftCell);
        
        const rightCell = document.createElement('td');
        rightCell.textContent = formatNumber(rightSide);
        row.appendChild(rightCell);
        
        const resultCell = document.createElement('td');
        if (isCorrect) {
            resultCell.innerHTML = '<span class="check-icon">✓</span>';
        } else {
            resultCell.innerHTML = '<span class="error-icon">✗</span>';
        }
        row.appendChild(resultCell);
        
        verificationTable.appendChild(row);
    }
    
    verificationContainer.appendChild(verificationTable);
    
    const conclusionP = document.createElement('p');
    conclusionP.style.marginTop = '10px';
    conclusionP.style.fontWeight = 'bold';
    
    if (allCorrect) {
        verificationContainer.classList.add('success');
        conclusionP.textContent = '¡La solución es correcta! Todas las ecuaciones se satisfacen.';
    } else {
        verificationContainer.classList.add('error');
        conclusionP.textContent = 'Hay errores en la solución. Algunas ecuaciones no se satisfacen correctamente.';
    }
    
    verificationContainer.appendChild(conclusionP);
}

// Función para cargar ejemplos predefinidos
function loadExample() {
    const exampleId = document.getElementById('examples').value;
    if (!exampleId) return;
    
    let sizeValue, coefficients, constants;
    
    switch (exampleId) {
        case 'example1': // Ejemplo 2x2 simple
            sizeValue = 2;
            coefficients = [
                [2, 1],
                [1, 3]
            ];
            constants = [5, 10];
            break;
        case 'example2': // Ejemplo 3x3 con fracciones
            sizeValue = 3;
            coefficients = [
                [1, 1/2, 1/3],
                [1/4, 1/5, 1/6],
                [1/7, 1/8, 1/9]
            ];
            constants = [1, 2, 3];
            break;
        case 'example3': // Ejemplo 4x4 complejo
            sizeValue = 4;
            coefficients = [
                [5, 2, 1, 1],
                [2, 4, 0, 1],
                [1, 0, 3, 2],
                [1, 1, 2, 4]
            ];
            constants = [29, 20, 15, 28];
            break;
        case 'example4': // Sistema sin solución
            sizeValue = 2;
            coefficients = [
                [1, 2],
                [2, 4]
            ];
            constants = [3, 7];
            break;
        case 'example5': // Sistema con infinitas soluciones
            sizeValue = 3;
            coefficients = [
                [1, 2, 3],
                [2, 4, 6],
                [3, 6, 9]
            ];
            constants = [6, 12, 18];
            break;
        default:
            return;
    }
    
    // Actualizar el tamaño del sistema
    document.getElementById('size').value = sizeValue;
    generateMatrix();
    
    // Llenar los coeficientes
    for (let i = 0; i < sizeValue; i++) {
        for (let j = 0; j < sizeValue; j++) {
            const input = document.getElementById(`a${i}${j}`);
            // Convertir fracciones a formato de cadena si es necesario
            if (coefficients[i][j] === Math.floor(coefficients[i][j])) {
                input.value = coefficients[i][j];
            } else {
                // Buscar representación de fracción
                const fraction = toFraction(coefficients[i][j]);
                input.value = `${fraction.numerator}/${fraction.denominator}`;
            }
        }
        
        // Llenar los términos independientes
        const input = document.getElementById(`b${i}`);
        input.value = constants[i];
    }
}// Código para unir todos los componentes

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la página
    generateMatrix();
    updateMethodInfo();
    
    // Configurar listener para el toggle de contenido educativo
    const eduHeader = document.querySelector('.edu-header');
    if (eduHeader) {
        eduHeader.addEventListener('click', toggleEducationalContent);
    }
    
    // Mostrar el contenido educativo al inicio
    setTimeout(() => {
        const content = document.getElementById('educational-content');
        if (content) {
            content.classList.add('show');
            document.querySelector('.toggle-icon').textContent = '▲';
        }
    }, 500);
    
    // Configurar listeners para teclas Enter en inputs
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && 
            (event.target.classList.contains('coefficient-input') || 
             event.target.id === 'size' || 
             event.target.id === 'method')) {
            solveSystem();
        }
    });
});

// Mejorar la presentación de la solución cuando hay infinitas soluciones
function formatInfiniteSolutionsExpression(A, b) {
    // Esta es una implementación simplificada y no cubre todos los casos posibles
    const n = A.length;
    
    // Encontrar variables libres y dependientes mediante rango
    const augmentedMatrix = [];
    for (let i = 0; i < n; i++) {
        augmentedMatrix[i] = [...A[i], b[i]];
    }
    
    // Aplicar eliminación Gaussiana para encontrar la forma escalonada
    // Esto es una aproximación y no funciona en todos los casos
    
    let expressionHTML = '<div class="infinite-solutions">';
    expressionHTML += '<p>El sistema tiene infinitas soluciones que pueden expresarse en términos de parámetros.</p>';
    expressionHTML += '<p>Los parámetros libres representan grados de libertad en la solución.</p>';
    expressionHTML += '</div>';
    
    return expressionHTML;
}

// Función para manejar errores de cálculo
function handleMathError(error) {
    console.error("Error en cálculos matemáticos:", error);
    
    const resultContainer = document.getElementById('solution-result');
    resultContainer.innerHTML = '';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Se ha producido un error en los cálculos. Por favor, revise los valores introducidos y asegúrese de que forman un sistema válido.';
    
    resultContainer.appendChild(errorDiv);
}

// Sobrescribir funciones para manejar errores
const originalSolveSystem = solveSystem;
solveSystem = function() {
    try {
        originalSolveSystem();
    } catch (error) {
        handleMathError(error);
    }
};

// Función para mostrar la matriz como ecuación
function showMatrixAsEquation(A, b) {
    const n = A.length;
    let equationHTML = '<div class="equations-display">';
    
    for (let i = 0; i < n; i++) {
        let eqStr = '';
        let hasTerms = false;
        
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j]) < 1e-10) continue;
            
            if (A[i][j] > 0 && hasTerms) {
                eqStr += ' + ';
            } else if (A[i][j] < 0) {
                eqStr += ' - ';
            }
            
            const absCoeff = Math.abs(A[i][j]);
            if (Math.abs(absCoeff - 1) < 1e-10) {
                eqStr += `x<sub>${j+1}</sub>`;
            } else {
                eqStr += `${formatNumber(absCoeff)}x<sub>${j+1}</sub>`;
            }
            
            hasTerms = true;
        }
        
        if (!hasTerms) eqStr = '0';
        eqStr += ` = ${formatNumber(b[i])}`;
        
        equationHTML += `<div class="equation">Ecuación ${i+1}: ${eqStr}</div>`;
    }
    
    equationHTML += '</div>';
    return equationHTML;
}

// Agregar efecto visual a la matriz aumentada
function highlightPivot(A, b, pivotRow, pivotCol) {
    const augmentedA = [];
    const augmentedB = [];
    
    for (let i = 0; i < A.length; i++) {
        augmentedA[i] = [...A[i]];
        augmentedB[i] = b[i];
    }
    
    // Marcar el pivote con clase especial para CSS
    const pivotValue = augmentedA[pivotRow][pivotCol];
    augmentedA[pivotRow][pivotCol] = `<span class="highlight">${formatNumber(pivotValue)}</span>`;
    
    return { A: augmentedA, b: augmentedB };
}

// Inicialización de ejemplos y métodos específicos
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar información detallada cuando cambie el método
    const methodSelect = document.getElementById('method');
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            updateMethodInfo();
        });
    }
});
