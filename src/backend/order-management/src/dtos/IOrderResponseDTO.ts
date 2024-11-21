export default interface IOrderResponseDTO {
    order_id: string;
    amount: string | null;
    created_at: Date | null;
    updated_at: Date | null;
}