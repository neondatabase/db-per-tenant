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
import type { FileDropItem } from "react-aria";
import { MAX_FILE_SIZE } from "../../lib/constants";
import { Spinner } from "../icons/spinner";
import { CheckCircle } from "../icons/check-circle";

export const Upload = () => {
	const navigate = useNavigate();
	const [file, setFile] = useState<File | FileDropItem | undefined>();

	const upload = useMutation({
		mutationFn: async (file: File) => {
			if (file.size > MAX_FILE_SIZE) {
				throw new Error("File size exceeds the maximum limit of 10MB");
			}

			const res = await fetch("/api/document/upload", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					filename: file.name,
					fileSize: file.size,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error);
			}

			return res.json();
		},
		onSuccess: async (data, file) => {
			const uploadRes = await fetch(data.url, {
				method: "PUT",
				body: file,
			});

			if (!uploadRes.ok) {
				throw new Error(
					"An error occurred while uploading the file to storage",
				);
			}
		},
		onError: (error: Error) => {
			console.error("Upload error:", error);
			toast.error(`Upload failed: ${error.message}`);
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
			const res = await fetch("/api/document/vectorize", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filename, title }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(
					errorData.message || "An error occurred while ingesting the file",
				);
			}

			return res.json();
		},
		onError: (error: Error) => {
			console.error("Ingest error:", error);
			toast.error(`File processing failed: ${error.message}`);
		},
	});

	const handleSubmit = async (file: File) => {
		if (!file) {
			toast.error("No file selected");
			return;
		}

		try {
			const uploadResult = await upload.mutateAsync(file);
			const ingestResult = await ingest.mutateAsync({
				filename: uploadResult.filename,
				title: uploadResult.title,
			});
			navigate(`/documents/${ingestResult.document.documentId}/chat`);
		} catch (error) {
			console.error("Submit error:", error);
			// Error is already handled in the respective mutation's onError
		}
	};

	const handleFileSelection = async (selectedFile: File) => {
		if (selectedFile.type !== "application/pdf") {
			toast.error("Only PDF files are allowed");
			return;
		}
		setFile(selectedFile);
		await handleSubmit(selectedFile);
	};

	return (
		<>
			{!file ? (
				<>
					<p className="mb-3">
						Download sample file -{" "}
						<a
							target="_blank"
							rel="noreferrer"
							className="underline hover:no-underline text-muted-high-contrast underline-offset-4"
							href="https://s2.q4cdn.com/470004039/files/doc_earnings/2023/q4/filing/_10-K-Q4-2023-As-Filed.pdf"
						>
							FORM 10-K - Apple Inc.{" "}
						</a>
					</p>
					<DropZone
						onDrop={async (e) => {
							const files = e.items.filter(
								(file) => file.kind === "file",
							) as FileDropItem[];

							if (files && files.length > 0) {
								const file = await files[0].getFile();
								await handleFileSelection(file);
							}
						}}
						className="w-full gap-y-5 min-h-[50vh] flex items-center justify-center p-10"
					>
						<FileTrigger
							allowsMultiple={false}
							acceptedFileTypes={[".pdf"]}
							onSelect={async (files) => {
								if (files && files.length > 0) {
									await handleFileSelection(files[0]);
								}
							}}
						>
							<FileUpload className="size-10" />
							<p>Drag & drop your PDF file here</p>
							<p>or</p>
							<Button size="lg" className="ml-2" variant="outline">
								Choose file to upload
							</Button>

							<Text size="xs"> Maximum PDF file size is 10MB</Text>
						</FileTrigger>
					</DropZone>
				</>
			) : (
				<div className="w-full gap-y-5 min-h-[50vh] flex flex-col items-center justify-center p-10">
					<Heading>File Selected</Heading>
					<Text>{file.name}</Text>
					{upload.isPending && (
						<p className="flex items-center gap-2">
							Uploading <Spinner className="w-4 h-4" />
						</p>
					)}
					{upload.isSuccess && (
						<p className="flex items-center gap-2">
							File uploaded successfully <CheckCircle className="w-4 h-4" />
						</p>
					)}
					{upload.isError && (
						<p className=" flex items-center gap-2 text-red-500">
							Upload failed: {upload.error.message}
						</p>
					)}

					{ingest.isPending && (
						<p className="flex items-center gap-2">
							Processing <Spinner className="w-4 h-4" />
						</p>
					)}
					{ingest.isSuccess && (
						<p className="flex items-center gap-2">
							File ingested successfully <CheckCircle className="w-4 h-4" />
						</p>
					)}
					{ingest.isError && (
						<p className="text-red-500">
							Processing failed:
							{ingest.error.message}
						</p>
					)}
				</div>
			)}
		</>
	);
};
