import React from 'react';
import Image from 'next/image';
import { wilayas } from '@/app/data/wilayas';
import { communes } from '@/app/data/communes.js';

interface Commune {
  id: string;
  post_code: string;
  name: string;
  wilaya_id: string;
  ar_name: string;
  longitude: string;
  latitude: string;
}

interface PersonalInfoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    mobile: string;
    birthCertificateNumber: string;
    birthDate: string;
    wilayaId: string;
    communeId: string;
    photo: string | null;
  };
  onUpdate: (
    data: Partial<{
      firstName: string;
      lastName: string;
      mobile: string;
      birthCertificateNumber: string;
      birthDate: string;
      wilayaId: string;
      communeId: string;
      photo: string | null;
    }>
  ) => void;
}

export function PersonalInfoStep({ formData, onUpdate }: PersonalInfoStepProps) {
  const handleChange = (field: keyof typeof formData, value: string) => {
    onUpdate({ [field]: value });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Filter communes based on selected wilaya
  const filteredCommunes = React.useMemo(() => {
    if (!formData.wilayaId) return [];
    return communes.filter((commune) => commune.wilaya_id === formData.wilayaId);
  }, [formData.wilayaId]);

  // Get selected wilaya name
  const selectedWilaya = React.useMemo(() => {
    if (!formData.wilayaId) return null;
    return wilayas.find((w) => w.id === formData.wilayaId);
  }, [formData.wilayaId]);

  // Get selected commune name
  const selectedCommune = React.useMemo(() => {
    if (!formData.communeId) return null;
    return communes.find((c) => c.wilaya_id === formData.wilayaId && c.id === formData.communeId);
  }, [formData.communeId, formData.wilayaId]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Informations Personnelles</h2>
        <p className="text-gray-600 mb-6">Veuillez fournir vos informations personnelles.</p>
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
          Prénom
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
          Nom
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Mobile */}
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
          Numéro de Téléphone
        </label>
        <div className="mt-1">
          <input
            type="tel"
            id="mobile"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Birth Certificate Number */}
      <div>
        <label htmlFor="birthCertificateNumber" className="block text-sm font-medium text-gray-700">
          Numéro d'Acte de Naissance
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="birthCertificateNumber"
            value={formData.birthCertificateNumber}
            onChange={(e) => handleChange('birthCertificateNumber', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
          Date de Naissance
        </label>
        <div className="mt-1">
          <input
            type="date"
            id="birthDate"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Wilaya */}
      <div>
        <label htmlFor="wilayaId" className="block text-sm font-medium text-gray-700">
          Wilaya de Résidence
        </label>
        <div className="mt-1">
          <select
            id="wilayaId"
            value={formData.wilayaId}
            onChange={(e) => {
              const selectedWilayaId = e.target.value;
              handleChange('wilayaId', selectedWilayaId);
              // Reset commune when wilaya changes
              handleChange('communeId', '');
              console.log('Selected wilaya:', selectedWilayaId);
              console.log('Available communes:', filteredCommunes);
            }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionnez une wilaya</option>
            {wilayas.map((wilaya) => (
              <option key={wilaya.id} value={wilaya.id}>
                {wilaya.code} - {wilaya.name} ({wilaya.ar_name})
              </option>
            ))}
          </select>
        </div>
        {selectedWilaya && (
          <p className="mt-1 text-sm text-gray-500">Code: {selectedWilaya.code}</p>
        )}
      </div>

      {/* Commune */}
      <div>
        <label htmlFor="communeId" className="block text-sm font-medium text-gray-700">
          Commune de Résidence
        </label>
        <div className="mt-1">
          <select
            id="communeId"
            value={formData.communeId}
            onChange={(e) => handleChange('communeId', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={!formData.wilayaId}
            required
          >
            <option value="">Sélectionnez une commune</option>
            {filteredCommunes.map((commune) => (
              <option key={commune.id} value={commune.id}>
                {commune.post_code} - {commune.name} ({commune.ar_name})
              </option>
            ))}
          </select>
        </div>
        {selectedCommune && (
          <p className="mt-1 text-sm text-gray-500">Code Postal: {selectedCommune.post_code}</p>
        )}
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Photo</label>
        <div className="mt-1 flex items-center space-x-4">
          {formData.photo ? (
            <div className="relative w-24 h-24">
              <Image src={formData.photo} alt="Profile" fill className="rounded-lg object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No photo</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
      </div>
    </div>
  );
}
