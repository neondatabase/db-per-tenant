import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FileUpload } from "../icons/file-upload";
import { Button } from "../ui/button";
import { DropZone } from "../ui/dropzone";
import { FileTrigger } from "../ui/file-trigger";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { useNavigate } from "@remix-run/react";
import { toast } from "sonner";

export const Upload = () => {
	const navigate = useNavigate();

	const upload = useMutation({
		mutationFn: async (file: File) => {
			const res = await fetch("/api/document/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filename: file.name }),
			});

			if (!res.ok) {
				throw new Error("An error occurred while uploading the file");
			}

			const data = await res.json();

			return data;
		},
		onSuccess: async (data) => {
			const uploadRes = await fetch(data.url, {
				method: "PUT",
				body: file,
			});

			if (!uploadRes.ok) {
				throw new Error("An error occurred while uploading the file");
			}
		},
		onError: (error) => {
			console.error(error);
			toast.error(`Something went wrong: ${error.message}`);
		},
	});

	const ingest = useMutation({
		mutationFn: async ({
			filename,
			title,
		}: {
			filename: string;
			title: string;
		}) => {
			// API call to the ingest endpoint at /document/ingest
			const res = await fetch("/api/document/vectorize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filename, title }),
			});

			if (!res.ok) {
				throw new Error("An error occurred while ingesting the file");
			}

			const data = await res.json();

			return data;
		},
	});

	const [file, setFile] = useState<File | undefined>();

	const handleSubmit = async (file) => {
		if (file) {
			upload.mutate(file, {
				onSuccess: (data) => {
					ingest.mutate(
						{
							filename: data.filename,
							title: data.title,
						},
						{
							onSuccess: (data) => {
								return navigate(`/documents/${data.document.documentId}/chat`);
							},
							onError: (error) => {
								console.error(error);
								toast.error(`Something went wrong: ${error.message}`);
							},
						},
					);
				},
			});
		}
	};

	// on DropZone drop, upload the file. hide the file trigger. show the file name and a loading spinner
	return (
		<>
			{!file ? (
				<DropZone className="w-full gap-y-5 min-h-[50vh] flex items-center justify-center p-10">
					<FileTrigger
						allowsMultiple={false}
						acceptedFileTypes={[".pdf"]}
						onSelect={async (files) => {
							if (files && files.length > 0) {
								setFile(files[0]);
								await handleSubmit(files[0]);
							}
						}}
					>
						<FileUpload className="size-10" />
						<Button size="lg" variant="ghost">
							Drag & drop or choose file to upload
						</Button>
						<Text size="xs"> Maximum PDF file size is 50mb</Text>
					</FileTrigger>
				</DropZone>
			) : (
				<div className="w-full gap-y-5 min-h-[50vh] flex flex-col items-center justify-center p-10">
					<Heading>File Selected</Heading>
					<Text>{file.name}</Text>
					{upload.isPending && <p>Uploading...</p>}
					{upload.isSuccess && <p>File uploaded successfully</p>}

					{ingest.isPending && <p>Processing...</p>}
					{ingest.isSuccess && <p>File ingested successfully</p>}
				</div>
			)}
		</>
	);
};
