import MessageForm from "../MessageForm";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MessageForm messageId={id} />;
}
