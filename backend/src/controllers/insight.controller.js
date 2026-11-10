import * as insightService from '../services/insight.service.js';
import { ok } from '../utils/apiResponse.js';
import { badRequest } from '../utils/errors.js';

// ?refresh=true forces regeneration instead of serving the cached insight.
const wantsRefresh = (req) => req.query?.refresh === 'true';

export const symptomTriage = async (req, res) => {
  const { symptoms } = req.body ?? {};
  if (typeof symptoms !== 'string') throw badRequest('symptoms: must not be blank');
  const data = await insightService.symptomTriage(req.user, symptoms, wantsRefresh(req));
  return ok(res, 'Triage assessment ready', data);
};

export const medicationSafety = async (req, res) =>
  ok(res, 'Medication review ready', await insightService.medicationSafety(req.user, wantsRefresh(req)));

export const carePlan = async (req, res) =>
  ok(res, 'Care plan ready', await insightService.carePlan(req.user, wantsRefresh(req)));

export const myRisk = async (req, res) =>
  ok(res, 'Risk score ready', await insightService.myRisk(req.user, wantsRefresh(req)));

export const compareRecord = async (req, res) =>
  ok(res, 'Comparison ready', await insightService.compareRecord(req.user, req.params.id, wantsRefresh(req)));

export const monthlyTrends = async (req, res) =>
  ok(res, 'Monthly analysis ready', await insightService.monthlyTrends(req.user, wantsRefresh(req)));

export const patientRisk = async (req, res) =>
  ok(res, 'Risk score ready', await insightService.riskById(req.params.id, wantsRefresh(req)));

export const population = async (req, res) =>
  ok(res, 'Population insights ready', await insightService.population(req.user, wantsRefresh(req)));

export const transcribe = async (req, res) => {
  const text = await insightService.transcribe(req.file);
  return ok(res, 'Audio transcribed', { text });
};
