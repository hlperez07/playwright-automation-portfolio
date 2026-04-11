import React, { useState } from 'react';
import { 
  BookOpen, 
  Github, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Wrench, 
  Download,
  ChevronRight,
  Terminal,
  FileCode2,
  CheckCircle2
} from 'lucide-react';

// --- CONTENIDO MARKDOWN PARA DESCARGAR ---
const markdownContent = `# 📑 Plan de Implementación: QA Agent Hybrid Framework

## 1. Resumen Ejecutivo
Este plan establece una arquitectura híbrida donde **GitHub** actúa como el cerebro central (Gobernanza) y el **IDE** (Cursor, VS Code, etc.) actúa como el brazo ejecutor (Productividad). El objetivo es estandarizar la creación de pruebas bajo normas ISTQB, garantizar la seguridad de los datos y optimizar el uso de tokens.

---

## 2. Fase 1: Infraestructura de Gobernanza (GitHub)
**Objetivo:** Crear la "Única Fuente de Verdad".

### Artefactos a crear:
* **Repositorio Central:** \`qa-standards-core\`.
* **Estructura de Documentación:** Subir los 14 archivos \`.md\` originales.
* **Archivo Maestro de Reglas:** Generar un \`COMPACT.md\` actualizado que resuma las 10 skills principales para ahorro de tokens.

### Validaciones:
* [ ] Los archivos deben tener permisos de solo lectura para el equipo general.
* [ ] El \`00-protocol.md\` debe ser el archivo de lectura obligatoria en el onboarding.

---

## 3. Fase 2: Configuración del Ecosistema (IDE & AI)
**Objetivo:** Inyectar el conocimiento en la IA del desarrollador.

### Configuración por Herramienta:
* **Cursor:** Crear \`.cursorrules\` en la raíz del proyecto con el contenido de \`COMPACT.md\`.
* **GitHub Copilot:** Crear \`.github/copilot-instructions.md\` con el contenido de \`COMPACT.md\`.
* **Claude (Web):** Crear un "Project" y subir \`COMPACT.md\` y \`00a-elicitation.md\` como conocimiento base.

### Validaciones:
* [ ] **Sanity Check:** Al preguntar "¿Cuál es nuestra política de esperas fijas?", la IA debe citar \`04-e2e-playwright.md\` prohibiendo \`waitForTimeout\`.

---

## 4. Fase 3: El Ciclo de Vida (Los 4 Phase Gates)
**Objetivo:** Asegurar que ningún código se escriba sin diseño previo.

| Fase | Gate | Objetivo | Condición de Bloqueo |
| :--- | :--- | :--- | :--- |
| **0. Requisitos** | **Elicitation** | Entender el dominio y los AC. | No hay ACs claros o URL/Spec definida. |
| **1. Análisis** | **Requirements Lock** | Definir técnica ISTQB y Matriz. | No se ha seleccionado una técnica (BVA, EP, etc). |
| **2. Diseño** | **Design Lock** | Estructurar casos Happy/Negative. | La cobertura es < 2 tests por AC. |
| **3. Código** | **Implementation Lock** | Escribir TypeScript/Playwright. | Hay \`waitForTimeout\` o falta de factories. |
| **4. Entrega** | **Delivery Lock** | Verificación final y seguridad. | No hay variables de entorno o hay secretos expuestos. |

---

## 5. Fase 4: Automatización y Sincronización
**Objetivo:** Mantener los estándares actualizados.

### Script de Sincronización (\`sync-rules.sh\`):
\`\`\`bash
#!/bin/bash
# Descarga la última versión de las reglas compactas del repo central
curl -s https://raw.githubusercontent.com/[TU_ORG]/qa-standards/main/COMPACT.md > .cursorrules
echo "✅ Estándares de QA actualizados localmente."
\`\`\`

### Husky Hooks:
Configurar un \`pre-commit\` que verifique que no existan \`test.only()\` o secretos hardcodeados antes de permitir el push.

---

## 6. Troubleshooting: Corrección de la IA

* **Si la IA ignora los Gates:** *"STOP. Según el protocolo [00], estamos en Gate 0. Detecta el dominio y presenta el cuestionario antes de proponer código."*
* **Si usa selectores frágiles:** *"Revisa [04-e2e-playwright]. Prohíbimos selectores CSS/XPath puros. Usa getByRole o getByTestId."*
* **Si expone secretos:** *"Incumplimiento de seguridad [00]. Mueve esa credencial a process.env inmediatamente."*

---

## 7. Resumen de Artefactos a Entregar

1. **\`COMPACT.md\`**: Resumen optimizado para tokens.
2. **\`.cursorrules\` / \`.github/copilot-instructions.md\`**: Configuración del IDE.
3. **\`fixtures/base.fixture.ts\`**: Extensión de Playwright con Page Objects.
4. **\`factories/data.factory.ts\`**: Generador de datos dinámicos con UUIDs.
5. **\`sync-rules.sh\`**: Script de actualización de estándares.

---
**Justificación:** Este plan garantiza que la IA no sea solo un generador de texto, sino un **Ingeniero de Calidad** que sigue procesos formales, reduciendo drásticamente la creación de pruebas inestables (flaky) y brechas de seguridad.
`;

// --- ESTRUCTURA INTERACTIVA (VISTAS JSX) ---
const steps = [
  {
    id: 'intro',
    title: '1. Resumen Ejecutivo',
    icon: BookOpen,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p className="text-lg">¡Bienvenido al equipo de QA Automation! 👋</p>
        <p>
          Este onboarding te guiará en la implementación de nuestra arquitectura híbrida. Nuestro modelo utiliza <strong>GitHub</strong> como el cerebro central (Gobernanza) y tu <strong>IDE</strong> (Cursor, VS Code, etc.) como el brazo ejecutor asistido por IA (Productividad).
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6 rounded-r-lg">
          <h3 className="font-bold text-blue-800 mb-2">Nuestro Objetivo Principal:</h3>
          <p className="text-blue-900 text-sm">
            Estandarizar la creación de pruebas bajo normativas ISTQB, garantizar la seguridad absoluta de los datos y optimizar el uso de tokens en nuestros asistentes de Inteligencia Artificial.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'gobernanza',
    title: '2. Gobernanza (GitHub)',
    icon: Github,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>
          La <strong>"Única Fuente de Verdad"</strong> de nuestros estándares vive en nuestro repositorio central de GitHub.
        </p>
        
        <h3 className="font-bold text-slate-900 mt-6 border-b pb-2">Artefactos a crear / consultar:</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Repositorio Central:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-sm text-pink-600">qa-standards-core</code></li>
          <li><strong>Estructura:</strong> 14 archivos <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">.md</code> detallados (Testing Design, API Testing, etc).</li>
          <li><strong>El Archivo Maestro:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded font-bold text-sm text-indigo-600">COMPACT.md</code> (Un resumen optimizado de ~2,000 tokens para que lo lean nuestras IAs).</li>
        </ul>

        <div className="bg-amber-50 border border-amber-200 p-4 mt-6 rounded-lg">
          <h4 className="font-bold text-amber-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Checklist de Validación
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            <li className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Los archivos tienen permisos de solo lectura.</li>
            <li className="flex items-center gap-2"><input type="checkbox" className="rounded" /> El archivo <code>00-protocol.md</code> fue leído por completo.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'configuracion',
    title: '3. Configuración del IDE',
    icon: Settings,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>Inyecta el conocimiento de QA en tu asistente de IA local para que programe bajo nuestros estándares.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <h4 className="font-bold flex items-center gap-2 mb-2"><Terminal className="w-4 h-4 text-slate-500" /> Cursor IDE</h4>
            <p className="text-sm">Crea el archivo <code className="text-pink-600 bg-slate-100 px-1 rounded">.cursorrules</code> en la raíz de tu proyecto e inserta el contenido de <code>COMPACT.md</code>.</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
            <h4 className="font-bold flex items-center gap-2 mb-2"><Github className="w-4 h-4 text-slate-500" /> GitHub Copilot</h4>
            <p className="text-sm">Crea el archivo <code className="text-pink-600 bg-slate-100 px-1 rounded">.github/copilot-instructions.md</code> con el contenido de <code>COMPACT.md</code>.</p>
          </div>
        </div>

        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mt-6">
          <h4 className="font-bold text-emerald-800">Prueba de Fuego (Sanity Check):</h4>
          <p className="text-sm text-emerald-900 mt-1">
            Pregúntale a tu IA: <em>"¿Cuál es nuestra política de esperas fijas?"</em>. Si responde citando <code>04-e2e-playwright.md</code> y prohíbe <code>waitForTimeout</code>, estás listo.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'gates',
    title: '4. Los 4 Phase Gates',
    icon: ShieldCheck,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>Para garantizar la calidad, ningún código se escribe sin diseño previo. Tu IA y tú deben pasar estas 4 puertas secuencialmente:</p>
        
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-2 border-b">Fase</th>
                <th className="px-4 py-2 border-b">Gate</th>
                <th className="px-4 py-2 border-b">Condición de Bloqueo (¡No avanzar si...!)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="px-4 py-3 font-semibold">0. Requisitos</td>
                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Elicitation</span></td>
                <td className="px-4 py-3">No hay ACs (Acceptance Criteria) claros o URL definida.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">1. Análisis</td>
                <td className="px-4 py-3"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold">Req. Lock</span></td>
                <td className="px-4 py-3">No se ha seleccionado una técnica ISTQB (BVA, EP).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">2. Diseño</td>
                <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold">Design Lock</span></td>
                <td className="px-4 py-3">La matriz de cobertura tiene &lt; 2 tests (Falta camino negativo).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">3. Código</td>
                <td className="px-4 py-3"><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">Impl. Lock</span></td>
                <td className="px-4 py-3">El código generado usa <code>waitForTimeout</code> o faltan Factories.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">4. Entrega</td>
                <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold">Delivery Lock</span></td>
                <td className="px-4 py-3">Hay secretos expuestos en texto plano (API Keys, tokens).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'sincronizacion',
    title: '5. Sincronización',
    icon: RefreshCw,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>Mantén las reglas de tu IDE actualizadas con respecto al repositorio central utilizando nuestro script estandarizado.</p>

        <div className="bg-slate-900 rounded-lg p-4 mt-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
            <FileCode2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-xs font-mono">sync-rules.sh</span>
          </div>
          <pre className="text-emerald-400 text-sm font-mono whitespace-pre-wrap">
{`#!/bin/bash
# Descarga la última versión de las reglas compactas
curl -s https://raw.githubusercontent.com/[TU_ORG]/qa-standards/main/COMPACT.md > .cursorrules
echo "✅ Estándares de QA actualizados localmente."`}
          </pre>
        </div>

        <h3 className="font-bold mt-6">Git Hooks (Husky)</h3>
        <p className="text-sm">
          Se requiere configurar un <code>pre-commit</code> hook que ejecute un linter para prevenir subir código con <code>test.only()</code> o credenciales expuestas.
        </p>
      </div>
    )
  },
  {
    id: 'troubleshooting',
    title: '6. Troubleshooting',
    icon: Wrench,
    content: () => (
      <div className="space-y-4 text-slate-700">
        <p>Las Inteligencias Artificiales pueden sufrir de "alucinaciones" o fatiga de contexto. Usa estos prompts rápidos para encarrilar a tu IA:</p>

        <div className="space-y-3 mt-4">
          <div className="bg-white border-l-4 border-red-500 p-3 shadow-sm">
            <h4 className="font-bold text-sm">🚩 La IA ignora los Gates y lanza código directo</h4>
            <p className="text-xs text-slate-500 italic mt-1 font-mono bg-slate-100 p-2 rounded">
              "STOP. Según el protocolo [00], estamos en Gate 0. Detecta el dominio y presenta el cuestionario antes de proponer código."
            </p>
          </div>
          
          <div className="bg-white border-l-4 border-amber-500 p-3 shadow-sm">
            <h4 className="font-bold text-sm">🚩 Usa selectores frágiles (XPath/CSS complejos)</h4>
            <p className="text-xs text-slate-500 italic mt-1 font-mono bg-slate-100 p-2 rounded">
              "Revisa [04-e2e-playwright]. Prohíbimos selectores CSS/XPath puros. Usa aserciones web-first de Playwright (getByRole, getByText)."
            </p>
          </div>

          <div className="bg-white border-l-4 border-purple-500 p-3 shadow-sm">
            <h4 className="font-bold text-sm">🚩 Expone Secretos o Tokens</h4>
            <p className="text-xs text-slate-500 italic mt-1 font-mono bg-slate-100 p-2 rounded">
              "Incumplimiento de seguridad severo [00]. Mueve esa credencial a process.env inmediatamente."
            </p>
          </div>
        </div>
      </div>
    )
  }
];

export default function App() {
  const [activeStep, setActiveStep] = useState(0);

  // Genera y descarga el archivo markdown
  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plan_Implementacion_QA.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const CurrentContent = steps[activeStep].content;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Navbar Superior */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">QA Agent Onboarding</h1>
              <p className="text-slate-400 text-xs">Framework Híbrido: GitHub + AI IDE</p>
            </div>
          </div>
          
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Guía (.md)</span>
          </button>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sidebar Navegación */}
        <aside className="md:col-span-4 lg:col-span-3 space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 ml-2">Fases del Plan</h2>
          <nav className="flex flex-col gap-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="flex-1">{step.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Área de Contenido */}
        <section className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-[500px]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              {React.createElement(steps[activeStep].icon, { className: "w-8 h-8 text-indigo-500" })}
              <h2 className="text-2xl font-bold text-slate-800">
                {steps[activeStep].title}
              </h2>
            </div>
            
            <div className="animate-in fade-in duration-300">
              <CurrentContent />
            </div>
            
            {/* Botones de Paginación Interna */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between">
              <button 
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition font-medium"
              >
                Anterior
              </button>
              <button 
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded shadow-sm disabled:opacity-30 transition font-medium"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}