import { ExclamationIcon } from "@heroicons/react/solid";
import React, { useRef, useState } from "react";
import devLog from "../../lib/devLog";
import useStorage from "../../hooks/useStorage";
import { zencode_exec } from "zenroom";
import signFile from "../../zenflows-crypto/src/sign_file";

var SHA512 = require("crypto-js/sha512");
var BASE64URL = require("crypto-js/enc-base64url");
var CryptoJS = require("crypto-js/");

type BrImageUploadProps = {
  onChange: (i: Images) => void;
  setImagesFiles: (images: Array<any>) => void;
  label: string;
  placeholder: string;
  hint?: string;
  className?: string;
  value?: Array<{ file: any; base64: string }>;
  testID?: string;
  clickToUpload?: string;
};
type Image = {
  description: string;
  extension: string;
  hash: string;
  mimeType: string;
  name: string;
  signature: any;
  size: number;
};
type Images = Array<Image>;

const BrImageUpload = ({
  onChange,
  setImagesFiles,
  label,
  placeholder,
  hint,
  className,
  value,
  testID,
  clickToUpload = "click to upload",
}: BrImageUploadProps) => {
  const [imagesPreview, setImagesPreview] = useState([] as Array<string>);
  const [error, setError] = useState("");
  const { getItem } = useStorage();
  const zenKeys = `
        {
            "keyring": {
                "eddsa": "${getItem("eddsa_key")}"
            }
        }
    `;
  const isNotImageSelected = value?.length === 0;

  function arrayBufferToWordArray(ab: any) {
    var i8a = new Uint8Array(ab);
    var a = [];
    for (var i = 0; i < i8a.length; i += 4) {
      a.push((i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | i8a[i + 3]);
    }
    return CryptoJS.lib.WordArray.create(a, i8a.length);
  }

  const convertBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = error => {
        reject(error);
      };
    });
  };

  const populatePreviews = async (files: Array<any>) => {
    let generatedResponse: Array<any> = [];
    await Promise.all(
      files!.map(async (f: any) => {
        await convertBase64(f).then(res => generatedResponse.push(res));
      })
    );
    setImagesPreview(generatedResponse);
  };

  function handleUpload(elements: any) {
    const images: Images = [];
    let error = "";
    setError(error);
    Array.from(elements).forEach(async (element: any) => {
      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.svg|\.gif)$/i;
      if (element.size > 2000000000) {
        error = "One or more image is too big in size";
      } else if (!allowedExtensions.exec(element.name)) {
        error = "One or more image has invalid file type";
      } else {
        const hash = await BASE64URL.stringify(SHA512(arrayBufferToWordArray(await element.arrayBuffer())));
        const zenData = `
        {
                "hashedFile": "${hash}",
        }
    `;
        devLog(element);
        devLog("hash:", hash);
        devLog("zenData:", zenData);
        const image: Image = {
          name: element.name,
          description: element.name,
          extension: element.name.split(".").at(-1),
          hash: hash,
          mimeType: element.type,
          size: element.size,
          signature: await zencode_exec(signFile(), {
            data: zenData,
            keys: zenKeys,
          }).then(({ result }) => JSON.parse(result).eddsa_signature),
        };
        images.push(image);
        devLog("image", image);
      }
    });
    if (error === "") {
      onChange(images);
      setImagesFiles(Array.from(elements));
      populatePreviews(Array.from(elements));
    } else {
      setError(error);
    }
  }

  devLog("previews", imagesPreview);

  return (
    <>
      <div className={`form-control ${className}`}>
        <label className="label">
          <h4 className="capitalize label-text">{label}</h4>
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            data-test={testID}
          >
            <>
              {isNotImageSelected && (
                <>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      aria-hidden="true"
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{clickToUpload}</span>
                    </p>
                    <p className="text-xs text-gray-500">{placeholder}</p>
                  </div>
                </>
              )}
              <div className="hidden object-contain grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4 grid-cols-5" />
              {!isNotImageSelected && (
                <div className={`grid grid-cols-${imagesPreview.length < 5 ? imagesPreview.length % 5 : 5} gap-1`}>
                  {imagesPreview?.map((i: any) => (
                    <>
                      <img src={i} className="object-contain max-h-64" />
                    </>
                  ))}
                </div>
              )}
              <input
                onDragStart={e => devLog("drag start", e)}
                id="dropzone-file"
                onDragEnter={e => devLog("drag enter", e)}
                type="file"
                className="hidden"
                onDrop={e => {
                  handleUpload(e.dataTransfer.files);
                }}
                onChange={e => {
                  handleUpload(e.target.files);
                }}
                multiple
              />
            </>
          </label>
        </div>
        <label className="label">
          {error && (
            <span className="flex flex-row items-center justify-between label-text-alt text-warning">
              <ExclamationIcon className="w-5 h-5" />
              {error}
            </span>
          )}
          {hint && <span className="label-text-alt">{hint}</span>}
        </label>
      </div>
    </>
  );
};

export default BrImageUpload;
