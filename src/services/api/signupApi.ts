import { normalizeApiResponse, normalizeInput, type ApiClientLike } from "./apiResult"
import { funeralHomeSignupInputSchema, funeralHomeSignupResultSchema } from "./schemas"
import type { AppApiResult, FuneralHomeSignupInputDto, FuneralHomeSignupResultDto } from "./types"

import { api } from "."

export const signupApi = {
  async createFuneralHomeSignup(
    input: FuneralHomeSignupInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<FuneralHomeSignupResultDto>> {
    const validated = normalizeInput(input, funeralHomeSignupInputSchema)
    if (!validated.ok) return validated

    const response = await client.apisauce.post("/api/public/funeral-home-signups", validated.data)
    return normalizeApiResponse(response, funeralHomeSignupResultSchema)
  },

  submitFuneralHomeApplication(
    input: FuneralHomeSignupInputDto,
    client: ApiClientLike = api,
  ): Promise<AppApiResult<FuneralHomeSignupResultDto>> {
    return signupApi.createFuneralHomeSignup(input, client)
  },
}
