import { TApiResponse } from "../types/api.type";
import { get, post } from "@/lib/axios-setup";

export interface IChildRegistration {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  class_id: number;
  book_private_tutor: boolean;
}

export interface IRegistrationPayload {
  parent_email: string;
  parent_first_name: string;
  parent_last_name: string;
  preferred_location_id: number;
  payment_provider: "stripe" | "paystack";
  stripe_ui_mode?: "hosted" | "embedded";
  success_url: string;
  cancel_url: string;
  children: IChildRegistration[];
}

export interface ILocation {
  id: number;
  name: string;
  address?: string;
}

export interface IClass {
  id: number;
  name: string;
  description?: string;
}

export interface ILocationResponse {
  locations: ILocation[];
}

export interface IClassResponse {
  classes: IClass[];
}

export interface IRegisterResponse {
  registration: {
    id: number;
    reference: string;
    status: string;
    parent_email: string;
    parent_first_name: string;
    parent_last_name: string;
    children_count: number;
    total_amount_ngn: number;
  };
  payment: {
    provider: string;
    provider_reference: string;
    checkout_url?: string;
    client_secret?: string;
    amount_ngn: number;
    amount_usd: number | null;
    currency: string;
    status: string;
  };
}

export async function fetchClasses(): Promise<TApiResponse<IClassResponse>> {
  const response = await get<TApiResponse<IClassResponse>>("/center/classes");
  return response;
}

export async function fetchLocations(): Promise<
  TApiResponse<ILocationResponse>
> {
  const response =
    await get<TApiResponse<ILocationResponse>>("/center/locations");
  return response;
}

export async function registerChildren(
  body: IRegistrationPayload,
): Promise<TApiResponse<IRegisterResponse>> {
  const response = await post<TApiResponse<IRegisterResponse>>(
    `/center/registrations`,
    body,
  );
  return response;
}
