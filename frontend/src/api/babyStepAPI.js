export const babyStepAPI = {
  getProgress: () => axios.get('/babysteps/progress'),
  recalculate: () => axios.post('/babysteps/recalculate'),
  updateTargets: (data) => axios.put('/babysteps/targets', data),
  getGazelleIntensity: () => axios.get('/babysteps/gazelle-intensity'),
  getSmallestDebt: () => axios.get('/babysteps/smallest-debt'),
  markStepComplete: (step) => axios.post(`/babysteps/mark-complete/${step}`)
};