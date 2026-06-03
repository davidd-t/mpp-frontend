export const STATUSES = ['indexed', 'indexing', 'failed']

export const PAGE_SIZE = 5

export const sampleFiles = {
  src: ['main.py', 'index.ts', 'router.ts', 'auth.ts'],
  backend: ['service.py', 'handlers.py'],
  tests: ['api.test.ts']
}

export const sampleCode = `from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def default_route():
    return {"Message": "App is running"}
`

export function validate(values) {
  const errors = []

  if (values.name.trim().length < 3) {
    errors.push(['name', 'Name must have at least 3 characters'])
  }
  if (!values.language.trim()) {
    errors.push(['language', 'Language is required'])
  }
  if (!Number.isInteger(values.filesCount) || values.filesCount < 0) {
    errors.push(['filesCount', 'Files must be an integer >= 0'])
  }
  if (!values.path.trim()) {
    errors.push(['path', 'Path is required'])
  }
  if (!values.embeddingModel.trim()) {
    errors.push(['embeddingModel', 'Embedding model is required'])
  }
  if (values.summary.trim().length < 5) {
    errors.push(['summary', 'Summary must have at least 5 characters'])
  }

  return Object.fromEntries(errors)
}

export function readHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path] = raw.split('?')
  return path
}

export function go(path) {
  window.location.hash = path
}
